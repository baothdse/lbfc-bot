let Intent = require('../intent');

class PostbackShowOrderDetailIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(["order see_detail \\$"], 1, true, false);
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

    /**
     * Trả về id của order muốn xem
     * @param {*} input 
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern1(input, match, pattern) {
        var orderId = input.substring(18, input.length);
        return {
            step: this.step,
            exception: this.exception,
            orderId: orderId
        }
    }
}

module.exports = PostbackShowOrderDetailIntent