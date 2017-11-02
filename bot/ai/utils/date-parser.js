class DateParser {

    constructor() {}

    static format(dateStr) {
        var str = dateStr.substring(6, dateStr.length - 2);
        var d = new Date(parseInt(str));
        return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
    }

    static formatDate(d) {
        return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
    }

    static toCSharpFormat(d) {
        return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();        
    }
}

module.exports = DateParser