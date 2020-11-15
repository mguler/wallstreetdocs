const http = require("https");

//this method makes http post requests and sends payloads in json format, returns deserialized json data from response  
exports.postJson = async (url, headers ,data) => {

    //create a promise
    var promise = new Promise(function (resolve, reject) {

        //create the parameters for a http request
        var options = {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            }
        };

        //if data passed serialize it
        var serialized = data ? JSON.stringify(data) : null;        

        //Set the content length header for the given payload
        options.headers['Content-Length'] = serialized ? serialized.length : 0;

        //override headers
        if (headers) {
            //override
            options.heaaders = Object.assign(options.headers, headers);
        }

        //make the http request
        var req = http.request(url, options, res => {
            //cache for response
            var response = "";
            //handle data event for capture response data
            res.on('data', responseData => response += responseData.toString());
            //handle request finish  
            res.on('end', () => {
                try {
                    //deserialize response data
                    var deserialized = JSON.parse(response);
                    //return the data
                    resolve(deserialized);
                } catch {
                    //handle errors and reject the promise
                    reject();
                }
            })
 
        });

        //handle errors on request
        req.on('error', error => {
            //reject the promise
            reject();
        });

        //if data to be posted available 
        if (serialized) {
            //send the 
            req.write(serialized)
        }
        //finish the request
        req.end();
    });

    //return the promise 
    return promise;
}

//this method makes http get requests , returns deserialized json data from response  
exports.getJson = async (url,headers) => {

    //create a promise
    var promise = new Promise(function (resolve, reject) {

        //create the parameters for a http request
        var options = {
            method: "get",
            headers: {
                'Accept': 'application/json'
            }
        };

        //override headers
        if (headers) {
            //override
            options.heaaders = Object.assign(options.headers, headers);
        }

        //make the http request
        var req = http.request(url, options, res => {
            //cache for response
            var response = "";
            //handle data event for capture response data
            res.on('data', responseData => response += responseData.toString());
            //handle request finish  
            res.on('end', () => {
                try {
                    //deserialize response data
                    var deserialized = JSON.parse(response);
                    //return the data
                    resolve(deserialized);
                } catch {
                    //handle errors and reject the promise
                    reject();
                }
            })
        });

        //handle errors on request
        req.on('error', error => {
            //reject the promise
            reject();
        });

        //finish the request
        req.end();

    });

    //return the promise
    return promise;
}


