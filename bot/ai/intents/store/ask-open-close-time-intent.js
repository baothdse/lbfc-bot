let Intent = require('../intent');

class AskOpenCloseTimeIntent extends Intent {
    constructor(step, exception, session) {
        super(step, exception, session);
        this.addPatterns(['mấy giờ đóng cửa'], 1, true, false);
        this.addPatterns(['mấy giờ mở cửa'], 1, true, false);
        this.addPatterns(['quán mở cửa lúc máy giờ'], 1, true, false);
        this.addPatterns(['quán đóng cửa lúc mấy giờ'], 1, true, false);
    }

    getResult(input, match, which, pattern) {
        var result = null;
        switch(which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            default: break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        return {
            step : this.step,
            exception: this.exception
        }
    }
}

module.exports = AskOpenCloseTimeIntent;