let Intent = require('../intent');
let await = require('asyncawait/await')
var Request = require('../../utils/request')
class SearchPriceIntent extends Intent {
    constructor(step, exception) {
        super(step, exception)
        this.addPatterns(['GioiTu', 'Number', 'DonViTien', 'GioiTu', 'Number', 'DonViTien'], 1)
        this.addPatterns(['GioiTu', 'Number', 'DonViTien'], 2)
        this.addPatterns(['Number', 'DonViTien'], 3)
        this.addPatterns(['Number'], 6)
        this.addPatterns(['Number', 'DonViTien', '-', 'Number', 'DonViTien'], 4)
        this.addPatterns(['MoneyTeenCode'], 5)
    }


    getResult(input, match, which, pattern) {

        console.log("ĐANG  GET RESULT CỦA SEARCH")
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
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        console.log("ĐANG  MATCH PATTERN 1 CỦA SEARCH PRICE")
        var that = this;
        let inputArray = input.split(" ", 10);
        console.log(inputArray)
        let fromPrice = inputArray[1] * 1000;
        let toPrice = inputArray[4] * 1000;
        let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }, ''))
        let listProduct = JSON.parse(data)
        console.log(listProduct)
        return {
            listProduct: listProduct,
            step: that.step,
            exception: that.exception
        }
    }
    matchPattern2(input, match, pattern) {
        console.log("ĐANG  MATCH PATTERN 2 CỦA SEARCH PRICE")
        var that = this;
        let inputArray = input.split(" ", 10);
        let fromPrice = 0;
        let toPrice = 0;
        if (inputArray[0].match(/(trên| từ)/i)) {
            fromPrice = inputArray[1] * 1000;
            toPrice = 10000000;
        } else if (inputArray[0].match(/(dưới| tầm | khoảng)/i)) {
            toPrice = inputArray[1] * 1000
        }
        let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }))
        let listProduct = JSON.parse(data)
        return {
            listProduct: listProduct,
            step: that.step,
            exception: that.exception
        }
    }
    matchPattern3(input, match, pattern) {
        console.log("ĐANG  MATCH PATTERN 5 CỦA SEARCH PRICE")
        var fromPrice = 0;
        var toPrice = 0;
        if (input.length = 5) {
            fromPrice = (input * 10) - 10000;
        }
    }
    matchPattern4(input, match, pattern) {

    }
    matchPattern5(input, match, pattern) {
        console.log("ĐANG  MATCH PATTERN 5 CỦA SEARCH PRICE")
    }
    matchPattern6(input, match, pattern) {
        console.log("ĐANG  MATCH PATTERN 6 CỦA SEARCH PRICE")
        var that = this;
        let fromPrice = 0;
        let toPrice = input * 1000;
        let data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', { 'from': fromPrice, 'to': toPrice }))
        let listProduct = JSON.parse(data)
        return {
            listProduct: listProduct,
            step: that.step,
            exception: that.exception
        }
    }
}

module.exports = SearchPriceIntent;