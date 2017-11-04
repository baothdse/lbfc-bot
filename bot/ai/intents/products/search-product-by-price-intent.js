let Intent = require('../intent');
let await = require('asyncawait/await')
var Request = require('../../utils/request')
class SearchPriceIntent extends Intent {
    constructor(step, exception) {
        super(step, exception)
        this.addPatterns(["Giá tiền"], 1, true, true);
        this.addPatterns(["Giá"], 1, true, true);
        this.addPatterns(["DongTuTimKiem", "theo giá"], 1);
    }


    getResult(input, match, which, pattern) {

        console.log("------STANDING AT SEARCH PRODUCT BY PRICE INTENT-----")
        console.log(input)
        console.log("match: + " + match)
        console.log("which : \n" + which)
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

module.exports = SearchPriceIntent;