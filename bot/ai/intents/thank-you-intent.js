let Intent = require('./intent');

class ThankyouIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['cảm ơn'], 1);
        this.addPatterns(['cám ơn'], 1);
        this.addPatterns(['thanks'], 1);
        this.addPatterns(['tks'], 1);
        this.addPatterns(['ths'], 1);
        this.addPatterns(['thank you'], 1);
        this.addPatterns(['arigato'], 1);
        this.addPatterns(['arigatou'], 1);
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
     * 
     * @param {string} input 
     * @param {*} match 
     * @param {Pattern} pattern 
     */
    matchPattern1(input, match, pattern) {
        return {
            step: this.step,
            exception: this.exception,
        }
    }
}

module.exports = ThankyouIntent