
function Tim() {
    this.words = [];
    this.words.push("tìm");
    this.words.push("tìm kiếm");
    this.words.push("search")
}

Tim.prototype.getWords = function () {
    return this.words;
}

module.exports = Tim;