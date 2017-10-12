"use strict";
var util = require("./../utilities");
var _ = require("underscore");
var BOT_REPLY_TYPE = require("./../constants").BOT_REPLY_TYPE;
var SimpleFilter = require("./simpleFilter");

class ButtonFilter extends SimpleFilter {
    constructor(inputText, output, buttons) {
        super(inputText, output);
        this._buttons = buttons;
    }

    reply(input) {
        return new Promise((resolve, reject) => resolve({
            output: this._output,
            buttons: this._buttons,
            type: BOT_REPLY_TYPE
        }))
    }
}

module.exports = ButtonFilter;