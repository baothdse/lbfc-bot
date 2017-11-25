let Intent = require('../intent');

class PostbackMembershipCardRefuseIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['membership card refuse'], 1, true, true);
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
            isUsed: false,
            step: this.step,
            exception: this.exception,
        }
    }
}

module.exports = PostbackMembershipCardRefuseIntent