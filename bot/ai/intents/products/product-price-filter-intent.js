let Intent = require('../intent');

class ProductPriceFilterIntent extends Intent{
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(["DanhTuChiNoiChon", "Number", "DanhTuChiNoiChon", "Number"], 1);
        this.addPatterns(["DanhTuChiNoiChon", "Number"], 1);
        this.addPatterns(["Number", "Number"], 1);
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
        return {
            step: this.step,
            exception: this.exception,
        }
    }
}

module.exports = ProductPriceFilterIntent