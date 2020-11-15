const express = require("express");
const app = express();
const routeConfig = require("./routes")
const config = require("./config")

app.use('/', routeConfig);
app.listen(config.app.port, () => { console.log(`Startup Message : ${config.app.startupMessage}`) });