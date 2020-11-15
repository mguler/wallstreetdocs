const express = require('express')
const apiClient = require('./../../tools/apiClient')
const router = express()

router.get('/request', async (req, res) => {

    try {
        var result = await apiClient.requestReport();
        res.send({ isSuccessful  : result.job_id ? true : false, id: result.job_id });
    }
    catch {
        res.send({ isSuccessful: false });
    }

});


router.get('/get/:id', async (req, res) => {
    try {
        var id = req.params.id;
        var result = await apiClient.downloadReport(id);
        res.send(result);
    }
    catch (err){
        res.send({ isSuccessful: false });
    }
});

module.exports = router;