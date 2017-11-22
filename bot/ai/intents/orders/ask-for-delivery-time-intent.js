let Intent = require('../intent');

class AskForDeliveryTimeIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['mấy giờ giao hàng'], 1);
        this.addPatterns(['bao lâu giao hàng'], 1);
        this.addPatterns(['chừng nào giao hàng'], 1);
        this.addPatterns(['giao hàng bao lâu'], 1);
        this.addPatterns(['giao hàng mất bao lâu'], 1);
        this.addPatterns(['giao hàng mất nhiêu lâu'], 1);
        this.addPatterns(['giao hàng lâu không'], 1);
        this.addPatterns(['giao hàng lâu ko'], 1);
        this.addPatterns(['giao hàng lâu hông'], 1);
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
        return {
            step: this.step,
            exception: this.exception,
        }
    }

}


module.exports = AskForDeliveryTimeIntent

