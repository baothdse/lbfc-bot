'use strict';

var request = require('request');
let Async = require('asyncawait');

class Request {
    constructor() {

    }
    sendPostRequest(url, data) {
        var result = null;

        var options = {
            host: 'localhost',
            port: 42013,
            path: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        var httpRequest = http.request(options, function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                console.log("body: " + chunk);
                result = chunk;
                //callback(chunk);
            });
            response.on('error', function(chunk){
                console.log("error: " + chunk);
                reject(chunk);
            });
            response.on('end', function (response) {
                //response.send('ok');
            })
        });

        httpRequest.write(data);
        httpRequest.end();
        return result;
    }

    sendGetRequestAsync(url, query, data) {

        return new Promise(function (resolve, reject) {
            var result = null;
            var options = {
                url : 'http://localhost:42013' + url,
                qs: query,
                method: 'Get',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            console.log("query = === " + options.qs);

            var httpRequest = request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // Print out the response body
                    resolve(body);
                } else {
                    reject(body);
                }
            })
    
            //httpRequest.write(data);
            // httpRequest.end();
            
        });


    }
}

module.exports = Request