const http = require("https");

exports.postJson = async (url, headers ,data) => {

    var promise = new Promise(function (resolve, reject) {

        var options = {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var serialized = data ? JSON.stringify(data) : null;        
        options.headers['Content-Length'] = serialized ? serialized.length : 0;

        //override headers
        if (headers) {
            options.heaaders = Object.assign(options.headers, headers);
        }


        var req = http.request(url, options, res => {

            var response = "";
            res.on('data', responseData => response += responseData.toString());
            res.on('end', () => {
                //handle errors here (deserialization errors etc)
                try {
                    var deserialized = JSON.parse(response);
                    resolve(deserialized);
                } catch {
                    reject();
                }
            })
 
        });

        req.on('error', error => {
            reject();
        });

        //if data to be posted available 
        if (serialized) {
            req.write(serialized)
        }
        req.end();

    });
    return promise;
}

exports.getJson = async (url,headers) => {

    var promise = new Promise(function (resolve, reject) {

        var options = {
            method: "get",
            headers: {
                'Accept': 'application/json'
            }
        };

        if (headers) {
            options.heaaders = Object.assign(options.headers, headers);
        }

        var req = http.request(url, options, res => {
            var response = "";
            res.on('data', responseData => response += responseData.toString());
            res.on('end', () => {
                //handle errors here (deserialization errors etc)
                try {
                    var deserialized = JSON.parse(response);
                    resolve(deserialized);
                } catch {
                    reject();
                }
            })
        });

        req.on('error', error => {
            reject();
        });

        req.end();

    });
    return promise;
}


