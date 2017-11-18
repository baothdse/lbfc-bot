let Intent = require('../intent');
let Pattern = require('../patterns/pattern')
const ConsoleLog = require('../../utils/console-log')

class ReceiveFullChangeOrderIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['đổi lại thành', '\\d+', 'DonVi', '\\w+'], 1);
        this.addPatterns(["sửa thành", '\\d+', 'DonVi', '\\w+'], 1);
        this.addPatterns(["sửa lại thành", '\\d+', 'DonVi', '\\w+'], 1);
        this.addPatterns(['đổi thành', '\\d+', 'DonVi', '\\w+'], 1);
        this.addPatterns(['đổi lấy', '\\d+', 'DonVi', '\\w+'], 1);
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

    /**
     * 
     * @param {string} input 
     * @param {*} match 
     * @param {Pattern} pattern 
     */
    matchPattern1(input, match, pattern) {
        let startSub = input.match(/\d+/i).index;
        let words = input.substring(startSub, input.length).split(' ');
        let quantity = input.match(/\d+/i)[0];
        let productName = '';
        for (let index = 2; index < words.length; index++) {
            productName += words[index] + ' ';
            
        }
        return {
            productName: productName.trim(),
            quantity,
            step: this.step,
            exception: this.exception,
        }
    }
}

module.exports = ReceiveFullChangeOrderIntent