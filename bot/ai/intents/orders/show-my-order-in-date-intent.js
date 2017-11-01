let Intent = require('../intent');
let ConsoleLog = require('../../utils/console-log');
let DateParser = require('../../utils/date-parser');

class ShowMyOrderInDateIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(["xem", "DanhTuDonHang", "ngày", "\\w+"], 1);
    }

    /**
     * Như trên
     * @param {string} input 
     * @param {RegExpExecArray} match 
     * @param {number} which Match tại pattern thứ mấy
     * @param {Pattern} pattern pattern đã dính
     */
    getResult(input, match, which, pattern) {
        var result = null;
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            default: break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        var dateStr = input.substring(input.indexOf("ngày") + 5, input.length);
        var d = new Date(dateStr);
        ConsoleLog.log("Date = " + d, "show-my-order-in-date.js", 29);
        if (d == "Invalid Date") {
            return {
                step: this.step,
                exception: this.exception,
                date: null,
            }
        }
        return {
            step: this.step,
            exception: this.exception,
            date: DateParser.toCSharpFormat(d),
        }
    }
}

module.exports = ShowMyOrderInDateIntent