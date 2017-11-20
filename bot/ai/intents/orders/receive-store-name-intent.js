let Intent = require('../intent');
var Request = require('../../utils/request')
var await = require('asyncawait/await')

class ReceiveStoreNameIntent extends Intent {
    constructor(step, exception, session) {
        super(step, exception, session);
        this.addPatterns(["Chọn cửa hàng"], 1, true, false)
        this.addPatterns(['Highlands'], 2, true, false)
        this.addPatterns(['Trung Nguyên'], 2, true, false)
    }

    getResult(input, match, which, pattern) {
        var result = null;
        console.log("Receive Store Name Intent")
        console.log(match)
        console.log(which)
        console.log(pattern)
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            case 2: result = this.matchPattern2(input, match, pattern); break;
            default: break;
        }
        return result
    }

    matchPattern1(input, match, pattern) {
        var info = (input.slice(15, input.length)).split("$", 2);
        return {
            storeId: info[0],
            storeName: info[1],
            step: this.step,
            exception: this.exception
        };
    }

    matchPattern2(input, match, pattern) {
        return {
            step: this.step,
            exception: this.exception
        }
    }
}

module.exports = ReceiveStoreNameIntent;