let Intent = require('../intent');

class ShowMenuIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['menu show'], 1, true);
        this.addPatterns(['DaiTu','DongTuYChi', 'DongTu', 'menu'], 1, true, false);
        this.addPatterns(['xem', 'menu'], 1);
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

module.exports = ShowMenuIntent