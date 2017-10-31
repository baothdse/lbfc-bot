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
            //case 2: result = this.matchPattern2(input, metch, pattern); break;
            default: break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        var info = (input.slice(5, input.length)).split("$", 5);
        var productId = info[0]
        var productName = info[1]
        var price = info[2]
        var productUrl = info[3]
        var brandId = info[4]

        return {
            productId : productId,
            productName : productName,
            price : price,
            productUrl: productUrl,
            brandId : brandId,
            step : this.step,
            exception : this.exception,
        }
    }

    // matchPattern2(input, match, pattern) {
    //     var storeId = input.split("$" , 1)[0];
    //     return {storeId : storeId};
    // }
}

module.exports = PostbackOrderIntent

