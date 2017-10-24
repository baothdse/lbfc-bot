
function DatHang(){
    this.words = [];
    this.words.push("đặt hàng");
    this.words.push("gọi món");
    this.words.push("đặt");
}

DatHang.prototype.getWords = function () {
    return this.words;
}

module.exports = {
    DatHang: DatHang
}