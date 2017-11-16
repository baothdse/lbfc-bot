let Intent = require('../intent');

class AskForMembershipIntent extends Intent {
    constructor(step, exception) {
        super(step, exception);
        this.addPatterns(['có tạo thẻ thành viên không'], 1);
        this.addPatterns(['có tạo thẻ không'], 1);
        this.addPatterns(['có làm thẻ thành viên không'], 1);
        this.addPatterns(['có làm thẻ thành viên ko'], 1);
        this.addPatterns(['có làm thẻ không'], 1);
        this.addPatterns(['có làm thẻ hông'], 1);
        this.addPatterns(['có tạo thẻ thành viên ko'], 1);
        this.addPatterns(['có tạo thẻ thành viên hông'], 1);
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

module.exports = AskForMembershipIntent