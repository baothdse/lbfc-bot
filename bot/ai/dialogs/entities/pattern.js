
class Pattern {
    constructor(string, step) {
        this.string = new RegExp(string, 'g');
        this.step = step;
    }

    isMatch(input) {
        return input.match(this.string);
    }

    getStep() {
        return this.step;
    }
}

module.exports = {
    Pattern : Pattern
}