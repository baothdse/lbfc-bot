let Intent = require('../intent');

class SearchProductByNameSimpleIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(["search product simple"], 1, true, true)
    }

    getResult(input, match, which, pattern) {
        let result = ""
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        return {
            step: this.step,
            exception: this.exception
        }
    }
}

module.exports = SearchProductByNameSimpleIntent