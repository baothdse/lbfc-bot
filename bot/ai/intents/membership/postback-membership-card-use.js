let Intent = require('../intent');

class PostbackMembershipCardUseIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['membership card use'], 1, true);
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
        let cardCode = input.substring('membership card use '.length, input.length);
        return {
            cardCode,
            isUsed: true,
            step: this.step,
            exception: this.exception,
        }
    }
}

module.exports = PostbackMembershipCardUseIntent