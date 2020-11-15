const linqer = require('@siderite/linqer');
const wait = require('./../../tools/wait');
const Swal = require('sweetalert2');
const $ = require("jquery");
const common = require("./common");

var currentData = null;

//Main entry point of Jquery , this method guarantees dom is created and ready
$(async () => {
    //handle event handlers
    await handleEvents();
    //load report
    await loadReport();
});

//this method set event handlers to elements
handleEvents = async () => {
    //reload button click event handler
    $("#reloadData").on("click", e => loadReport());
    $("#search").on("click", e => showData(currentData));
}

//this method loads reports from the server and updates the currentData 
loadReport = async () => {
    try {

        currentData = null;

        //show loading popup and block the screen
        common.showLoading("Please Wait", "report is being prepared");

        //request for a report
        var id = await common.requestReport();
        //wait for report being prepared (3 seconds for timeout)
        await wait(3000);

        //try download the report 
        var data = await common.downloadReport(id);

        //close active alert
        Swal.close();

        //if something wrong with data or status code is not 200 show alert and return from the function
        if (!data || data.status != 200) {
            await showError("Ooops", "Could not retrieve the report. Please try again in a few minutes");
            return;
        }

        //Prepare data and set global data property
        currentData = linqer.Enumerable.from(data.service_reports).select(item => {

            var newItem = Object.assign({
                alertMessage: ""
            }, item);

            var nodes = linqer.Enumerable.from(item.nodes).select(node => {
                var newNode = Object.assign({}, node);
                newNode.alertMessage = newNode.status_code == 501 ? "Not Implemented"
                    : newNode.status_code == 500 || node.status_code != 500 && node.checks && linqer.Enumerable.from(node.checks).any(check => check.state == "red") ? "Error Reported"
                        : node.checks && linqer.Enumerable.from(node.checks).any(check => check.state == "green") ? "OK" : "";
                return newNode;
            });

            newItem.alertMessage = item.nodes.length == 0 ? "No Hosts Registered" : nodes.aggregate("", (current, next) => `${current}<br>${next.alertMessage}`);
            newItem.nodes = nodes.toArray();

            return newItem;

        });

        //create table
        await showData(currentData);

    } catch (err) {
        //if an exceppion occurred
        await common.showError("Ooops", "Something went wrong. Please try again in a few minutes");
    }
}

//this method generates the filtered data and shows it by using charts
showData = async (data) => {

    //keyword
    var keyword = $("#filter").val();

    //filter the data
    data = data
        //filter by keyword
        .where(item => !keyword || keyword == "" || `${item.host.name}${item.alertMessage}`.toLowerCase().indexOf(keyword.toLowerCase()) != -1).toArray();

    //generate table code
    table = linqer.Enumerable.from(data).aggregate("", (current, next) => {
        try {
            var expandable = next.nodes.length > 0;
            var row = `${current}<tr class="test">${expandable ? "<td class='expandable-row'>+</td>" : "<td></td>"}<td>${next.host.name}</td><td>${next.alertMessage}</td></tr>`;

            if (expandable) {

                var nodeRows = linqer.Enumerable.from(next.nodes).aggregate("", (currentNodes, nextNode) => {
                    var expandableNode = nextNode.checks && nextNode.checks.length > 0;
                    var nodeRow = `${currentNodes}<tr>${expandableNode ? "<td class='expandable-row'>+</td>" : "<td></td>"}<td>${nextNode.web_node}</td><td>${nextNode.alertMessage}</td></tr>`;

                    if (expandableNode) {
                        var checkRows = linqer.Enumerable.from(nextNode.checks).aggregate("", (currentChecks, nextCheck) =>
                            `${currentChecks}<tr><td>${nextCheck.name}</td><td>${nextCheck.state == "green" ? "OK":"Error"}</td><td>${nextCheck.message}</td></tr>`);

                        var checksTable = `<table><thead><th>Name</th><th>State</th><th>Message</th></thead><tbody>${checkRows}</tbody></table>`;
                        nodeRow  = `${nodeRow}<tr class="collapsed"><td colspan="3">${checksTable}</td></tr>`;;
                    }

                    return nodeRow;
                });

                var nodesTable = `<table><thead><th></th><th>Node</th><th>Message</th></thead><tbody>${nodeRows}</tbody></table>`;
                row = `${row}<tr class="collapsed"><td colspan="3">${nodesTable}</td></tr>`;
            }

            return row;
        } catch (err) {

        }
    });

    //crate jquery instance
    var $table = $(table);
    //handle expandable row click event
    $table.find(".expandable-row").on("click", rowClickedEventHandler);
    //append to dom
    $("tbody").empty().append($table);
}

rowClickedEventHandler = async (e) => {
    var v = $(e.target).closest("tr").next();
    if (v.hasClass("collapsed")) {
        v.removeClass("collapsed");
        $(e.target).text("-");
    } else {
        v.addClass("collapsed");
        $(e.target).text("+");
    }

}
