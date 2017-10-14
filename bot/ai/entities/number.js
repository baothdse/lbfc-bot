let Entity = require('./entity');

class Number extends Entity.Entity {
    constructor() {
        super();
        this.words.push("\\d+");
    }
}

module.exports = {
    Number : Number
}