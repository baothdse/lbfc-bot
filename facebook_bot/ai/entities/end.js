let Entity = require('./entity');

class End extends Entity.Entity {
    constructor() {
        super();
        this.words.push("xong rồi");
        this.words.push("hết rồi");
        this.words.push("hết");
        this.words.push("xong");
        this.words.push("không còn");
    }
}

module.exports = End