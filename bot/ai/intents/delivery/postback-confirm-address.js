let Intent = require('../intent');

class PostbackConfirmAddressIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['address use '], 1, true);
        this.addPatterns(['address refuse'], 2, true, false);
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
            case 2: result = this.matchPattern2(input, match, pattern); break;
            default: break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        let address = input.substring('address use '.length, input.length);
        return {
            address,
            step: this.step,
            exception: this.exception,
        }
    }

    matchPattern2(input, match, pattern) {

        return {
            address: null,
            step: this.step,
            exception: this.exception,
        }
    }
}

module.exports = PostbackConfirmAddressIntent

