let ClassParser = require('../utils/class-parser');
let Brain = require('../brain');
let Pattern = require('./patterns/pattern');

class Intent {
    // constructor(step, exception) {
    constructor(step, exception, session) {

        /**
         * @type {[{pattern: Pattern, group : number}]}
         */
        this.patterns = [];

        /**
         * @type {number}
         */
        this.step = step;

        /**
         * @type {number}
         */
        this.exception = exception;
        
        this.session = session
    }

    /**
     * 
     * @param {[string]} arrayOfClassName array tên các class hoặc mảng gồm một chuỗi cố định
     * @param {number} group Số thứ tự của nhóm
     * @param {boolean} matchBegin Có cần match đầu câu không
     * @param {boolean} matchEnd Có cần match cuối câu không
     * @return {[{'Pattern' : Pattern, 'group' :number}]}
     */
    addPatterns(arrayOfClassName, group, matchBegin = false, matchEnd = false) {
        var parser = new ClassParser(arrayOfClassName);
        var patternParsed = parser.parse(matchBegin, matchEnd);
        var that = this;
        patternParsed.forEach(function (p) {
            that.patterns.push({
                pattern : new Pattern(p),
                group : group,
            });
        }, this);
    }


    /**
     * Trả về thông tin trích xuất được, null nếu không trùng pattern nào
     * @param {string} input user input
     * @returns {[step : number, exception : number]} trả về ít nhất step và exception  
     */
    match(input) {
        var that = this;
        for (var i = 0; i < this.patterns.length; ++i) {
            var matchResult = this.patterns[i].pattern.isMatch(input);
            if (matchResult != null) {
                return that.getResult(input, matchResult, this.patterns[i].group, this.patterns[i].pattern);
            }
        }
        return null;
    }

    getResult(input, matchResult, which, pattern) {
        return {productName : 'chó'};
    }

}

module.exports = Intent