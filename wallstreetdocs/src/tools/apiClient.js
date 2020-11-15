const httpClient = require("./httpClient");
const config = require("./../config");

//gets a token for accesing report api's by using credentials
exports.login = async () => {
    //invoke the auth api by given credentials and get the result
    var result = await httpClient.postJson(config.remoteApi.reporting.endpoints.auth,
        null,
        config.remoteApi.reporting.credentials);
    //return the result
    return result;
}

//this method sends a request for preparing a report, and returns a job id
exports.requestReport = async () => {

    //request a token
    var credentials = await this.login();

    //if token is not valid throw an exception
    if (!credentials.access_token) {
        //throw an exception
        throw new Error("not authorized");
    }

    //create a auth header
    var authHeader = { Authorization: `Bearer ${credentials.access_token}` };

    //invoke the report request api and get the api result
    var result = await httpClient.postJson(config.remoteApi.reporting.endpoints.request
        , authHeader);

    //return the api result
    return result;
}

//download the pre-requested report by job id
exports.downloadReport = async (id) => {

    //request a token
    var credentials = await this.login();

    //if token is not valid throw an exception
    if (!credentials.access_token) {
        //throw an exception
        throw new Error("not authorized");
    }

    //create a auth header
    var authHeader = { Authorization: `Bearer ${credentials.access_token}` };

    //invoke the api and get the api result
    var result = await httpClient.getJson(`${config.remoteApi.reporting.endpoints.download}/${id}`
        , authHeader);

    //return the api result
    return result;
}

