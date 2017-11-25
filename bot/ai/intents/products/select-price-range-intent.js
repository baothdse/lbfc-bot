let Intent = require('../intent');
let await = require('asyncawait/await')
var Request = require('../../utils/request')
const ConsoleLog = require('../../utils/console-log')

class SelectPriceRangeIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['GioiTu', 'Number', 'Dozen', 'GioiTu', 'Number', 'Dozen'], 1, true, true)
        this.addPatterns(['GioiTu', 'Number', 'Hundred', 'GioiTu', 'Number', 'Hundred'], 2, true, false)
        this.addPatterns(['GioiTu', 'Number', 'Dozen'], 3)
        this.addPatterns(['GioiTu', 'Number', 'Hundred'], 4)
        this.addPatterns(['Number', 'Dozen'], 5)
        this.addPatterns(['Number', 'Hundred'], 6)
        this.addPatterns(['MoneyTeenCode', '-', 'MoneyTeenCode'], 7, true, true)
        this.addPatterns([/\d+k-\d+k/i], 8)
        console.log(this.patterns)
        // this.addPatterns([/\d+/i], 9)

    }

    getResult(input, match, which, pattern) {

        console.log("------STANDING AT SELECT PRICE RANGE INTENT------")
        console.log(input)
        console.log("match: + " + match)
        console.log("which : \n" + which)
        let result = null;
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            case 2: result = this.matchPattern2(input, match, pattern); break;
            case 3: result = this.matchPattern3(input, match, pattern); break;
            case 4: result = this.matchPattern4(input, match, pattern); break;
            case 5: result = this.matchPattern5(input, match, pattern); break;
            case 6: result = this.matchPattern6(input, match, pattern); break;
            case 7: result = this.matchPattern7(input, match, pattern); break;
            case 8: result = this.matchPattern8(input, match, pattern); break;
            case 9: result = this.matchPattern9(input, match, pattern); break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        console.log("------ĐANG  MATCH PATTERN 1 CỦA SELECT PRICE RANGE INTENT------")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = inputArray[1] * 10000;
        let toPrice = inputArray[4] * 10000;
        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: 2,
            exception: that.exception
        }
    }

    /**
     * 
     * @param {*} input : từ n trăm/xị đến n trăm/xị
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern2(input, match, pattern) {
        console.log("-----MATCH PATTERN 2 INPUT TỪ N TRĂM ĐẾN N TRĂM-----")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = inputArray[1] * 100000;
        let toPrice = inputArray[4] * 100000;
        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: 2,
            exception: that.exception
        }
    }

    /**
     * 
     * @param {*} input : trên/dưới n chục
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern3(input, match, pattern) {
        console.log("------MATCH PATTERN 3 INPUT TRÊN/DƯỚI N CHỤC------")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = 0;
        let toPrice = 0;
        if (inputArray[0].match(/(trên|từ)/i)) {
            fromPrice = inputArray[1] * 10000;
            toPrice = inputArray[1] * 10000 + 10000;
        } else if (inputArray[0].match(/(dưới|tầm|khoảng)/i)) {
            toPrice = inputArray[1] * 10000
        }
        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: that.step,
            exception: that.exception
        }
    }

    /**
     * 
     * @param {*} input : trên/ dưới n trăm
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern4(input, match, pattern) {
        console.log("------MATCH PATTERN 4 INPUT TRÊN/DƯỚI N TRĂM------")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = 0;
        let toPrice = 0;
        if (inputArray[0].match(/(trên|từ)/i)) {
            fromPrice = inputArray[1] * 100000;
            toPrice = 10000000;
        } else if (inputArray[0].match(/(dưới|tầm|khoảng)/i)) {
            toPrice = inputArray[1] * 100000;
        }
        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: that.step,
            exception: that.exception
        }
    }

    /**
     *
     * @param {*} input  : n chục
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern5(input, match, pattern) {
        console.log("------MATCH PATTERN 5 INPUT N-Chục ------")
        let fromPrice = 0;
        let toPrice = 0;
        let inputPrice = input.match(/\d+/i);
        console.log(inputPrice)
        let that = this
        if (inputPrice[0] == 1) {
            toPrice = inputPrice[0] * 10000;
        } else if (inputPrice[0] > 1) {
            fromPrice = inputPrice[0] * 10000 - 10000;
            toPrice = inputPrice[0] * 10000 + 10000;
        }
        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: that.step,
            exception: that.exception
        }
    }

    /**
     * 
     * @param {*} input : n trăm
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern6(input, match, pattern) {
        console.log("------MATCH PATTERN 6 INPUT N-Trăm ------")
        let fromPrice = 0;
        let toPrice = 0;
        let inputPrice = input.match(/\d+/i);
        let that = this;
        if (inputPrice[0] == 1) {
            fromPrice = inputPrice[0] * 100000 - 30000
            toPrice = inputPrice[0] * 100000 + 30000;
        } else if (inputPrice[0] > 1) {
            fromPrice = inputPrice[0] * 100000 - 30000;
            toPrice = inputPrice[0] * 100000 + 30000;
        }

        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: that.step,
            exception: that.exception
        }
    }
    /**
     *  ['MoneyTeenCode']
     * @param {*} input: nk - nk
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern7(input, match, pattern) {
        console.log("------MATCH PATTERN 7 INPUT n-k - n-k ------")
        let that = this;
        // let newInput = input.replace(/k/g, "").split("-", 10);
        // console.log(newInput)
        var priceRange = input.match(/\d+/g);
        let fromPrice = 0;
        let toPrice = 0;
        console.log(priceRange)
        console.log(priceRange.length)
        if (priceRange.length < 2) {
            fromPrice = 0;
            toPrice = priceRange[0] * 1000;
        } else {
            fromPrice = priceRange[0] * 1000;
            toPrice = priceRange[1] * 1000;
        }
        console.log("From price " + fromPrice)
        console.log("to price " + toPrice)

        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: that.step,
            exception: that.exception
        }
    }

    /**
     * 
     * @param {*} input : nk-nk (30k-40k)
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern8(input, match, pattern) {
        ConsoleLog.log(`Match pattern 8`, 'select price range intent', 223);
        let that = this;
        var priceRange = input.match(/\d+/g);
        let fromPrice = 0;
        let toPrice = 0;
        console.log(priceRange)
        if (priceRange.length < 2) {
            fromPrice = 0;
            toPrice = priceRange[0] * 1000;
        } else {
            fromPrice = priceRange[0] * 1000;
            toPrice = priceRange[1] * 1000;
        }
        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: that.step,
            exception: that.exception
        }
    }

    /**
     * User chỉ nhập số Vd:50
     * @param {*} input 
     * @param {*} match 
     * @param {*} pattern 
     */
    matchPattern9(input, match, pattern) {
        ConsoleLog.log(`Match pattern 9`, 'select price range intent', 253);
        let fromPrice = 0;
        let toPrice = 0;
        if (parseInt(input) > 10 && parseInt(input) < 99) {
            fromPrice = parseInt(input) * 1000 - 10000;
            toPrice = parseInt(input) * 1000 + 10000;
        } else if (parseInt(input) < 10) {
            toPrice = parseInt(input) * 10000 + 20000;
        } else if (parseInt(input) > 100) {
            fromPrice = parseInt(input) * 1000 - 20000;
            toPrice = parseInt(input) * 1000 + 20000;
        }
        return {
            fromPrice: fromPrice,
            toPrice: toPrice,
            step: this.step,
            exception: this.exception
        }

    }
}
module.exports = SelectPriceRangeIntent