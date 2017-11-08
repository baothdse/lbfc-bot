let Intent = require('../intent');
let await = require('asyncawait/await')
let Request = require('../../utils/request')
class ShowMenuIntent extends Intent{
    constructor(step, exception) {
        super(step, exception)
        this.addPatterns(['DaiTu','DongTuYChi', 'DongTu', 'menu'], 1, true, false);
    }

    getResult(input, match, which, pattern) {
        let result = ""
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        let data = await(new Request().sendGetRequest('/LBFC/Product/GetStoreMenu'))
    }
}