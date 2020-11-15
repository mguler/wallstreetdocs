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
    //search button click event handler
    $("#search").on("click", e => showData(currentData));
    //filter keypress event handler
    $("#filter").on("keypress", e => {
        //if enter key pressed 
        if (e.keyCode == 13) {
            //make a search on data
            showData(currentData);
        }
    });
}

//this method loads reports from the server and updates the currentData 
loadReport = async () => {
    try {

        //set the current data null
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

            //prepare the nodes of item
            var nodes = linqer.Enumerable.from(item.nodes).select(node => {
                var newNode = Object.assign({}, node);
                newNode.alertMessage = newNode.status_code == 501 ? "Not Implemented"
                    : newNode.status_code == 500 || node.status_code != 500 && node.checks && linqer.Enumerable.from(node.checks).any(check => check.state == "red") ? "Error Reported"
                        : node.checks && linqer.Enumerable.from(node.checks).any(check => check.state == "green") ? "OK" : "";
                return newNode;
            });

            //set the alert message of the item
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

//this method generates the filtered data and table with expandable rows
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
            //if host has nodes this is a expandable row
            var expandable = next.nodes.length > 0;
            //generate the table row
            var row = `${current}<tr class="test">${expandable ? "<td class='expandable-row'>+</td>" : "<td></td>"}<td>${next.host.name}</td><td>${next.alertMessage}</td></tr>`;

            //if host has nodes generate a sub table for nodes
            if (expandable) {
                //generate the rows of sub table (for nodes)
                var nodeRows = linqer.Enumerable.from(next.nodes).aggregate("", (currentNodes, nextNode) => {
                    //if node has checks this is a expandable row
                    var expandableNode = nextNode.checks && nextNode.checks.length > 0;
                    //generate the sub table row (node row)
                    var nodeRow = `${currentNodes}<tr>${expandableNode ? "<td class='expandable-row'>+</td>" : "<td></td>"}<td>${nextNode.web_node}</td><td>${nextNode.alertMessage}</td></tr>`;

                    //if node has checks generate a sub table for checks
                    if (expandableNode) {
                        //generate the rows of subtable (checks)
                        var checkRows = linqer.Enumerable.from(nextNode.checks).aggregate("", (currentChecks, nextCheck) =>
                            `${currentChecks}<tr><td>${nextCheck.name}</td><td>${nextCheck.state == "green" ? "OK":"Error"}</td><td>${nextCheck.message}</td></tr>`);
                        //create the checks table and add rows
                        var checksTable = `<table><thead><th>Name</th><th>State</th><th>Message</th></thead><tbody>${checkRows}</tbody></table>`;
                        //merge the checks table with parent table
                        nodeRow = `${nodeRow}<tr class="collapsed"><td colspan="3">${checksTable}</td></tr>`;;
                    }
                    //return the generated node row
                    return nodeRow;
                });

                //create the checks table and add rows
                var nodesTable = `<table><thead><th></th><th>Node</th><th>Message</th></thead><tbody>${nodeRows}</tbody></table>`;
                //merge the checks table with parent table
                row = `${row}<tr class="collapsed"><td colspan="3">${nodesTable}</td></tr>`;
            }
            //return the generated table row
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

//this method handles click event for expandible row and supplies expand & collapse functionality
rowClickedEventHandler = async (e) => {
    //get the expansion of expandible row
    var collapsedRow = $(e.target).closest("tr").next();
    //if is it collapsed expand it
    if (collapsedRow.hasClass("collapsed")) {
        //remove the collapsed class for expand the row
        collapsedRow.removeClass("collapsed");
        //change the icon 
        $(e.target).text("-");
    }
    //collapse the row
    else {
        //add the collapsed class for collapse row
        collapsedRow.addClass("collapsed");
        //change the icon
        $(e.target).text("+");
    }

}
