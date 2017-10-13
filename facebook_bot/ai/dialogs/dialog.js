"use strict"
var Response = require('./entities/response');

class Dialog {
    constructor() {
        this.step = 1;
        this.patterns = [];
        this.status = "new"; //new hoặc end
    }

    isMatch(input) {
        var result = false;
        var that = this;
        this.patterns.some(function (pattern) {
            if (pattern.isMatch(input) != null) {
                that.step = pattern.getStep();
                result = true;
                return true;
            }
        }, this);
        return result;
    }

    end() {
        this.status = "end";
        return new Response.Response("Oke", true);
    }

    continue(){

    }

}

module.exports = Dialog