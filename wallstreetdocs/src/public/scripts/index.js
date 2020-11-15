const chart = require("chart.js");
const linqer = require('@siderite/linqer');
const wait = require('./../../tools/wait');
const Swal = require('sweetalert2');
const $ = require("jquery");
const common = require("./common");

var currentData = null;
var chart1 = null;
var chart2 = null;
var chart3 = null;

//Main entry point of Jquery , this method guarantees dom is created and ready
$(async () => {
    //handle event handlers
    await handleEvents();
    //load report
    await loadReport();
});

//this method set event handlers to elements
handleEvents = async () => {

    //reload buttn click event handler
    $("#reloadData").on("click", e => loadReport());
    //hosts dropdown change event handler
    $("#hostsFilter").on("change", hostsFilterChangedEventHandler);
    //nodes dropdown change event handler
    $("#nodesFilter").on("change", e => showData(currentData));

}

//handles
hostsFilterChangedEventHandler = (e) => {
    var hostId = parseInt($("#hostsFilter option:selected").val());
    var enumerable = linqer.Enumerable.from(currentData);

    var host = enumerable.where(item => item.host.id == hostId).singleOrDefault();
    if (!host) {
        return;
    }

    var nodes = linqer.Enumerable.from(host.nodes).aggregate("<option value=0>Select Node</option>", (current, next) => `${current}<option value="${next.web_node}">${next.web_node}</option>`);

    $("#nodesFilter").empty().append(nodes);

    showData(currentData);
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

        //Set global data property
        currentData = data.service_reports;

        //fill filter(s)
        await prepareFilters(currentData);
        //show charts
        await showData(currentData);

    } catch {
        //if an exceppion occurred
        await common.showError("Ooops", "Something went wrong. Please try again in a few minutes");
    }
}

//this method fills dropdown filters
prepareFilters = async (data) => {
    var enumerable = linqer.Enumerable.from(data);
    var hosts = enumerable.aggregate("<option value=0>Select Host</option>", (current, next) => `${current}<option ${next.nodes.length > 0 ? "class='bold'" : ""} value="${next.host.id}">${next.host.name}</option>`);
    $("#hostsFilter").empty().append(hosts);
}

//this function filters the data by selected filter options 
filterData = async (data) => {

    //selected filter values 
    var hostId = $("#hostsFilter").val();
    var nodeId = $("#nodesFilter").val();

    //filter the data
    var result = linqer.Enumerable.from(data)
        //filter by host
        .where(item => hostId == 0 || item.host.id == hostId)
        .select(item => {
            var newItem = Object.assign({}, item);
            //filter by node
            newItem.nodes = linqer.Enumerable.from(item.nodes).where(node => nodeId == 0 || node.web_node == nodeId).toArray();
            return newItem;
        }).toArray();

    return result;
} 

//this method generates the filtered data and shows it by using charts
showData = async (data) => {

    //filter the data before display
    var filtered = await filterData(data);
    var hosts = linqer.Enumerable.from(filtered);

    //status by hosts
    var noHostsRegistered = hosts.where(item => item.nodes.length == 0).count();
    var notImplemented = hosts.where(item => linqer.Enumerable.from(item.nodes).any(node => node.status_code == 501)).count();
    var errorReported = hosts.where(item => linqer.Enumerable.from(item.nodes)
        .any(node => node.status_code == 500 || node.status_code != 500 && node.checks && linqer.Enumerable.from(node.checks).any(check => check.state == "red"))).count();
    var ok = hosts.where(item => linqer.Enumerable.from(item.nodes)
        .any(node => node.checks && linqer.Enumerable.from(node.checks).all(check => check.state == "green"))).count();

    var data = [{ text: "OK", value: ok, color: "green" }
        , { text: "Error Reported", value: errorReported, color: "red" }
        , { text: "No Hosts Registered", value: noHostsRegistered, color: "yellow" }
        , { text: "Host Has Not Implemented Nodes", value: notImplemented, color: "blue" }];

    if (chart1) {
        chart1.destroy();
    }
    chart1 = await createChart("#mainChart", data);
    //end of status by hosts

    //status by nodes
    var nodes = hosts.selectMany(item => item.nodes)
        .groupBy(item => item.status_code == 501 ? "Not Implemented"
            : item.status_code == 500 || item.status_code != 500 && item.checks && linqer.Enumerable.from(item.checks).any(check => check.state == "red") ? "Errors Reported"
                : item.status_code == 200 && item.checks && linqer.Enumerable.from(item.checks).any(check => check.state == "green") ? "OK"
                    : "Other/Unknown")
        .select(group => {
            var item = {
                text: group.key,
                color: group.key == "OK" ? "green" : group.key == "Errors Reported" ? "red" : group.key == "Not Implemented" ? "blue" : "orange",
                value: group.length
            }
            return item;
        }).toArray();

    if (chart2) {
        chart2.destroy();
    }
    chart2 = await createChart("#chart2", nodes);
    //end of status by nodes

    //status by checks
    var checks = hosts.selectMany(item => linqer.Enumerable.from(item.nodes).selectMany(node => node.checks ? node.checks : []))
        .groupBy(check => check.state == "green" ? "OK" : "Error");
    checks = checks.select(group => {
        var item = {
            text: group.key,
            color: group.key == "OK" ? "green" : "red",
            value: group.length
        };
        return item;
    }).toArray();

    if (chart3) {
        chart3.destroy();
    }

    chart3 = await createChart("#chart3", checks);
    //end of status by checks

}

//this is chart generatr method , it created charts with given arguments
createChart = async (target, data) => {
    data = linqer.Enumerable.from(data);
    //drawing context of the target element
    var ctx = $(target)[0].getContext('2d');
    //draw chart and show data
    var chart = new Chart(ctx, {
        type: 'pie',
        data: {
            datasets: [{
                data: data.select(item => item.value).toArray(),
                backgroundColor: data.select(item => item.color).toArray()
            }],
            labels: data.select(item => item.text).toArray()
        },
        options: {
            responsive: true
        }
    });
    return chart;
}
