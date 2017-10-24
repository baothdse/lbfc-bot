
function DongTu(){
    this.words = [];
    this.words.push("muốn");
    this.words.push("xin");
}

DongTu.prototype.getWords = function () {
    return this.words;
}

module.exports = DongTu;