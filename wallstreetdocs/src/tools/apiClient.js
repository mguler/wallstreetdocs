const httpClient = require("./httpClient");
const config = require("./../config");

exports.login = async () => {
    var result = await httpClient.postJson(config.remoteApi.reporting.endpoints.auth,
        null,
        config.remoteApi.reporting.credentials);
    return result;
}

exports.requestReport = async () => {

    var credentials = await this.login();

    if (!credentials.access_token) {
        throw new Error("not authorized");
    }

    var authHeader = { Authorization: `Bearer ${credentials.access_token}` };
    var result = await httpClient.postJson(config.remoteApi.reporting.endpoints.request
        , authHeader);

    return result;
}


exports.downloadReport = async (id) => {

    var credentials = await this.login();

    if (!credentials.access_token) {
        throw new Error("not authorized");
    }

    var authHeader = { Authorization: `Bearer ${credentials.access_token}` };
    var result = await httpClient.getJson(`${config.remoteApi.reporting.endpoints.download}/${id}`
        , authHeader);

    return result;
}

