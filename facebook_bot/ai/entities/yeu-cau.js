
function YeuCau(){
    this.words = ["muốn mua", "cần mua", "muốn lấy", "lấy", "muốn uống", "muốn ăn", "muốn", "muốn kêu"];
}

YeuCau.prototype.getWords = function () {
    return this.words;
}

module.exports = {
    YeuCau : YeuCau
}