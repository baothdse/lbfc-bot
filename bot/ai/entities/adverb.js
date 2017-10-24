var Entity = require('./entity');
class Adverb extends Entity {

    constructor() {
        super();
        this.words.push("From");
        this.words.push("To");
        this.words.push("Từ");
        this.words.push("Đến");
        this.words.push("Khoảng");
        this.words.push("Khoảng chừng");
        this.words.push("Tầm");
    }
}
module.exports = Adverb;