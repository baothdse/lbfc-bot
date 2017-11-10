let Intent = require('../intent');

class AskDeliveryIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['có', 'DongTuGiaoHang', 'không'], 1);
        this.addPatterns(['có', 'DongTuGiaoHang', 'ko'], 1);
    }

    getResult(input, match, which, pattern) {
        let result = "";
        switch (which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            default: break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        return {
            reply: 'yes',
            step: this.step,
            exception: this.exception
        }
    }
}
module.exports = AskDeliveryIntent;