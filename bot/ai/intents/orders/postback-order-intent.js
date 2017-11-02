let Intent = require('../intent');

class PostbackOrderIntent extends Intent{
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['Đặt'], 1, true, false);
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
        var tmp = input.match(/^Đặt .+?(?=\d+)/g);
        var productName = tmp[0].substring(4, tmp[0].length - 1);
        var productId = input.match(/\d+/g);
        var info = (input.slice(5, input.length)).split("$", 5);
        // var productId = info[0]
        // var productName = info[1]
        // var price = info[2]
        // var productUrl = info[3]
        // var brandId = info[4]

        return {
            productId : productId,
            productName : productName,
            // price : price,
            // productUrl: productUrl,
            // brandId : brandId,
            step : this.step,
            exception : this.exception,
        }
    }
}

module.exports = PostbackOrderIntent
