let Intent = require('../intent');

class SearchProductFilterIntent extends Intent{
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(["Tên sản phẩm"], 1);
        this.addPatterns(["Giá tiền"], 1);
        this.addPatterns(["Giá"], 1);
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

module.exports = SearchProductFilterIntent

