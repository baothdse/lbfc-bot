let Intent = require('../intent');

class ReceiveProductNameIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['DaiTu', 'DongTuYChi', '\\w+'], 1);
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

    matchPattern1(input, match, pattern) {
        let productName = '';
        let inputs = input.split(' ');
        for (let index = 2; index < inputs.length; index++) {
            productName += input.split(" ")[index] + ' ';
        }
        console.log(productName);
        return {
            productName: productName.trim(),
            step: this.step,
            exception: this.exception,
        }
    }
    
}

module.exports = ReceiveProductNameIntent;