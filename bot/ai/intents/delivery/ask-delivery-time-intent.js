let Intent = require('../intent');

class AskDeliveryTimeIntent extends Intent {
    constructor(step, exception, session) {
        super(step, exception, session);
        this.addPatterns(['giao hàng trong bao lâu'], 1);
        this.addPatterns(['giao hàng mất bao lâu'], 1);
        this.addPatterns(['khoảng bao lâu thì hàng tới?'], 1);
        this.addPatterns(['lúc nào giao hàng'], 1);
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

module.exports = AskDeliveryTimeIntent;