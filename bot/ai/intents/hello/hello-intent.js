let Intent = require('../intent');

class HelloIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(["hello"], 1);
        this.addPatterns(["xin chào"], 1);
        this.addPatterns(["chao xìn"], 1);
        this.addPatterns(["halo"], 1);
        this.addPatterns(["hé lô"], 1);
        this.addPatterns(["hé nhô"], 1);
        this.addPatterns(["hi", 1], true, true);
        this.addPatterns(["alo"], 1);
        this.addPatterns(["ê"], 1, true, true);
        this.addPatterns(["ê mày"], 1);
        this.addPatterns(["chào"], 1);
        this.addPatterns(["hey"], 1);
        this.addPatterns(["a ey"], 1);
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

module.exports = HelloIntent