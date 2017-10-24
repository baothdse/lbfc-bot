
class Pattern {
    constructor(string, step) {
        this.string = new RegExp(string, 'i');
        this.step = step;
    }

    /**
     * 
     * @param {string} input 
     * @returns {RegExpExecArray}
     */
    isMatch(input) {
        return input.match(this.string);
    }

    getStep() {
        return this.step;
    }
}

module.exports = Pattern;