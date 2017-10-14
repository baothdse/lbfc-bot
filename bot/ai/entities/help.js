
function Help(){
    this.words = [];
    this.words.push("help");
    this.words.push("tôi không hiểu");
    this.words.push("là sao");
    this.words.push("tôi cần giúp đỡ");
}

Help.prototype.getWords = function () {
    return this.words;
}

module.exports = {
    Help: Help,
}