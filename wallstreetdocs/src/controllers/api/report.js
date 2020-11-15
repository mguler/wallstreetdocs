const express = require('express')
const apiClient = require('./../../tools/apiClient')
const router = express()

//this action handles report request suplies a bridge from client to 3rd party api's
router.get('/request', async (req, res) => {

    try {
        //request a report from 3rd party application and get the job id
        var result = await apiClient.requestReport();
        //return job id to the client
        res.send({ isSuccessful  : result.job_id ? true : false, id: result.job_id });
    }
    catch {
        //handle errors and send unsuccessful response to the client
        res.send({ isSuccessful: false });
    }

});

//this action handles report download request, suplies a bridge from client to 3rd party api's
//it takes job id parameter
router.get('/get/:id', async (req, res) => {
    try {
        //get the job id
        var id = req.params.id;
        //try download report
        var result = await apiClient.downloadReport(id);
        //send report data to the client
        res.send(result);
    }
    catch (err) {
        //handle errors and send unsuccessful response to the client
        res.send({ isSuccessful: false });
    }
});
//export the class
module.exports = router;