let Intent = require('../intent');
let await = require('asyncawait/await')
var Request = require('../../utils/request')

class SelectPriceRangeIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['GioiTu', 'Number', 'Dozen', 'GioiTu', 'Number', 'Dozen'], 1)
        this.addPatterns(['GioiTu', 'Number', 'Hundred', 'GioiTu', 'Number', 'Hundred'], 1)
        this.addPatterns(['GioiTu', 'Number', 'Dozen'], 3)
        this.addPatterns(['GioiTu', 'Number', 'Hundred'], 4)
        this.addPatterns(['Number', 'Dozen'], 5)
        this.addPatterns(['Number', 'Dozen'], 6)
        // this.addPatterns(['MoneyTeenCode'], 7, true, true)
        this.addPatterns(['MoneyTeenCode', '-', 'MoneyTeenCode'], 7, true, true)
        this.addPatterns(['Number', 'Dozen', '-', 'Number', 'Dozen'], 9)

    }

    getResult(input, match, which, pattern) {

        console.log("------STANDING AT SELECT PRICE RANGE INTENT------")
        console.log(input)
        console.log("match: + " + match)
        console.log("which : \n" + which)
        let result = ""
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            case 2: result = this.matchPattern2(input, match, pattern); break;
            case 3: result = this.matchPattern3(input, match, pattern); break;
            case 4: result = this.matchPattern4(input, match, pattern); break;
            case 5: result = this.matchPattern5(input, match, pattern); break;
            case 6: result = this.matchPattern6(input, match, pattern); break;
            case 7: result = this.matchPattern7(input, match, pattern); break;
            case 8: result = this.matchPattern8(input, match, pattern); break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        console.log("------ĐANG  MATCH PATTERN 1 CỦA SELECT PRICE RANGE INTENT------")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = inputArray[1] * 10000;
        let toPrice = inputArray[4] * 10000;
        let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }, ''))
        let listProduct = JSON.parse(data)
        return {
            listProduct: listProduct,
            step: 2,
            exception: that.exception
        }
    }

    matchPattern1(input, match, pattern) {
        console.log("-----MATCH PATTERN 2 CỦA SELECT PRICE RANGE INTENT-----")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = inputArray[1] * 100000;
        let toPrice = inputArray[4] * 100000;
        let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }, ''))
        let listProduct = JSON.parse(data)
        return {
            listProduct: listProduct,
            step: 2,
            exception: that.exception
        }
    }
    matchPattern3(input, match, pattern) {
        console.log("------MATCH PATTERN 3 CỦA SELECT PRICE RANGE INTENT------")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = 0;
        let toPrice = 0;
        if (inputArray[0].match(/(trên| từ)/i)) {
            fromPrice = inputArray[1] * 10000;
            toPrice = 10000000;
        } else if (inputArray[0].match(/(dưới| tầm | khoảng)/i)) {
            toPrice = inputArray[1] * 10000
        }
        let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }))
        let listProduct = JSON.parse(data)
        return {
            listProduct: listProduct,
            step: that.step,
            exception: that.exception
        }
    }

    matchPattern4(input, match, pattern) {
        console.log("------MATCH PATTERN 4 CỦA SELECT PRICE RANGE INTENT------")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = 0;
        let toPrice = 0;
        if (inputArray[0].match(/(trên| từ)/i)) {
            fromPrice = inputArray[1] * 100000;
            toPrice = 10000000;
        } else if (inputArray[0].match(/(dưới| tầm | khoảng)/i)) {
            toPrice = inputArray[1] * 100000;
        }
        let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }))
        let listProduct = JSON.parse(data)
        return {
            listProduct: listProduct,
            step: that.step,
            exception: that.exception
        }
    }
    matchPattern5(input, match, pattern) {
        console.log("------MATCH PATTERN 5 CỦA SELECT PRICE RANGE------")
        var fromPrice = 0;
        var toPrice = 0;
        if (input.length = 5) {
            fromPrice = (input * 10) - 10000;
        }
    }
    matchPattern6(input, match, pattern) {
        console.log("------MATCH PATTERN 6 CỦA SELECT PRICE RANGE------")
    }
    /**
     *  ['MoneyTeenCode']
     * @param {*} input 
     * @param {*} match 
     * @param {*} pattern 
     */
    // matchPattern7(input, match, pattern) {
    //     console.log("------MATCH PATTERN 7 CỦA SELECT PRICE RANGE------")
    //     var that = this;
    //     let fromPrice = 0;
    //     let toPrice = input.replace("k", "") * 1000;
    //     let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }))
    //     let listProduct = JSON.parse(data)
    //     return {
    //         listProduct: listProduct,
    //         step: that.step,
    //         exception: that.exception
    //     }
    // }
    /**
     * ['MoneyTeenCode', '-', 'MoneyTeenCode']
     */
    matchPattern7(input, match, pattern) {
        console.log("------MATCH PATTERN 7 CỦA SELECT PRICE RANGE------")
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

        let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }))
        let listProduct = JSON.parse(data)
        return {
            listProduct: listProduct,
            step: that.step,
            exception: that.exception
        }
    }
}
module.exports = SelectPriceRangeIntent