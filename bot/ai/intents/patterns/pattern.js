
class Pattern {
    constructor(string) {
        this.string = new RegExp(string, 'i');
    }

    isMatch(input) {
        var match = this.string.exec(input);
        return match;
    }

    /**
     * Trả về regex dưới dạng chuỗi /tôi/i => "tôi"
     * @returns {string} regex dưới dạng chuỗi
     */
    getString() {
        console.log('pattern:17----------------------')
        var str = this.string.toString();
        console.log('str = ' + str.substring(1, str.length - 2));
        return str.substring(1, str.length - 2);
    }
}

module.exports = Pattern