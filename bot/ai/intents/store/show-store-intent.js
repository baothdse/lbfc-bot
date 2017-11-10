let Intent = require('../intent');
let await = require('asyncawait/await')
let Request = require('../../utils/request')
class ShowStoreIntent extends Intent{
    constructor(step, exception) {
        super(step, exception)
        this.addPatterns(['hệ thống cửa hàng'], 1, true, false);
        this.addPatterns(['danh sách cửa hàng'], 1, true, false);
    }

    getResult(input, match, which, pattern) {
        var result = null;
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            default: break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        
        return {
            step : this.step,
            exception : this.exception
        }
    }
}
module.exports = ShowStoreIntent;