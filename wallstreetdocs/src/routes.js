const express = require("express");
const router = express();
const reportApi = require('./controllers/api/report')

router.use(express.static('./public'))

router.use("/api/report", reportApi);

module.exports = router;