
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
        var str = this.string.toString();
        str = str.substring(1, str.length - 2).replace('^', '').replace('\$', '').replace('d+', '[số]').replace('w+', '[chữ]');
        return str;
    }
}

module.exports = Pattern