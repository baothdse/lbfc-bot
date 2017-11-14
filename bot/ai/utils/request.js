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

    var result = null;
    var options = {
        url: 'http://localhost:42013' + url,
        method: 'POST',
        form: data,
        headers: {
        }
    };

    var httpRequest =  RequestPromise(options, function (error, response, body) {
        if (error) {
            console.log("Error");
        } else {
            result = body;
        }
    });

    return Promise.resolve(httpRequest);
    
}

/**
 * url bỏ http://localhost:42013
 */
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

    var httpRequest =  RequestPromise(options, function (error, response, body) {
        if (error) {
            console.log("Error");
        } else {
            result = body;
        }
    });
    
    return Promise.resolve(httpRequest);
}

/**
 * 
 */
Request.prototype.sendUniversalGetRequest =  function (url, query, data) {
    
    var result = null;
    var options = {
        url: url,
        qs: query,
        method: 'Get',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var httpRequest =  RequestPromise(options, function (error, response, body) {
        if (error) {
            console.log("Error");
        } else {
            result = body;
        }
    });
    
    return Promise.resolve(httpRequest);
}


module.exports = Request