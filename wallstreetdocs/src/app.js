const express = require("express");
const app = express();
const routeConfig = require("./routes")

app.use('/', routeConfig);
app.listen(9999, () => { console.log("!") });