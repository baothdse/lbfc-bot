let Intent = require('../intent');

class SearchProductByNameIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(["Tên sản phẩm"], 1, true, true);
        this.addPatterns(["DongTuTimKiem", "theo tên"], 1);
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

module.exports = SearchProductByNameIntent