let Intent = require('../intent');
let Brain = require('../../brain');

class ReceiveFullOrderIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['DongTuYChi', 'DaiTu', 'Number', 'DonVi', '.*?', 'TinhThaiTu'], 1);
        this.addPatterns(['DongTuYChi', 'DaiTu', 'Number', 'DonVi'], 2);
        this.addPatterns(['DongTuYChi', 'DaiTu', 'Number'], 3);
        this.addPatterns(['DongTuYChi', 'Number', 'DonVi'], 4);
        this.addPatterns(["Number", "DonVi"], 4);
        //this.addPatterns(["Number", "\\w+"], 4);
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
        console.log('receive intent:26 --------------------------------->');
        console.log(pattern);
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            case 2: case 3: case 4: result = this.matchPattern24(input, match); break;
            default: break;
        }
        return result;
    }


    /**
     * Trả về thông tin trích xuất, null nếu ko được
     * @param {string} input user input
     * @param {RegExpExecArray} match Kết quả của match
     * @param {Pattern} pattern pattern cần phân tích
     */
    matchPattern1(input, match, pattern) {
        var patternStr = pattern.getString();
        var number = input.match(/\d+/i);
        var orderQuantity = number[0];
        var donvi = patternStr.substring(patternStr.indexOf('\d+') + 4, patternStr.indexOf('.*?'));

        var substr = input.substring(input.indexOf(donvi) + donvi.length);
        var subPattern = new RegExp(patternStr.substring(patternStr.indexOf('.*?') + 4), 'i');
        console.log('sub pattern = ' + subPattern + ', sub string = ' + substr);
        var subMatch = subPattern.exec(substr);

        var productName = substr.substring(0, subMatch.index - 1);
        var result = {
            'productName': productName,
            'quantity': orderQuantity,
            'step': this.step,
            'exception': this.exception
        };
        console.log('receive-full-order-intent:57 ------------------------------------');
        console.log(result);

        return result;
    }

    /**
     * Trả về thông tin trích xuất, null nếu ko được
     * @param {string} input user input
     * @param {RegExpExecArray} match Kết quả của match
     * @returns {['productName', 'quantity', 'step', 'exception']}
     */
    matchPattern24(input, match) {
        var orderQuantity = input.match(/\d+/i)[0];
        var patternEndIndex = match.index + match[0].length + 1;
        var productName = input.substring(patternEndIndex, input.length);
        var result = {
            'productName': productName,
            'quantity': orderQuantity,
            'step': this.step,
            'exception': this.exception
        };
        return result;
    }

}

module.exports = ReceiveFullOrderIntent
