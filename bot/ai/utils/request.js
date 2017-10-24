'use strict';

var request = require('request');
let RequestPromise = require('request-promise');
var querystring = require('querystring');
let async = require("asyncawait/async");
let await = require("asyncawait/await");
var http = require('http');

function Request() {

}


Request.prototype.sendPostRequest = function (url, data) {
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
        response.on('error', function (chunk) {
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


Request.prototype.sendGetRequest =  function (url, query, data) {
    
    var result = null;
    var options = {
        url: 'http://localhost:42013' + url,
        qs: query,
        method: 'Get',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    console.log("query = === " + options.qs);

    var httpRequest =  RequestPromise(options, function (error, response, body) {
        if (error) {
            console.log("Error");
        } else {
            result = body;
            console.log("No error");
        }
    });
    // var httpRequest = http.request(options, function (response) {
    //     response.setEncoding('utf8');
    //     response.on('data', function (response) {
    //         console.log("body: " + response);
    //         result = response;
    //         //callback(chunk);
    //     });
    //     response.on('error', function (chunk) {
    //         console.log("error: " + chunk);
    //         reject(chunk);
    //     });
    //     response.on('end', function (response) {
    //         //response.send('ok');
    //     })
    // });
    
    return Promise.resolve(httpRequest);
}


module.exports = Request