"use strict";
let Entity = require('./entity');

class Number extends Entity {
    constructor() {
        super();
        this.words.push("\\d+");
        this.words.push(["một", "hai", "ba", "mot", "bốn", "bon", "năm", "nam", 
    "sáu", "sáo", "sau", "bảy", "bải", "bay", "tám", "tam", "chín", "chin", "mười", 
    "muoi", "chục", "trăm", "chuc", "tram"]);        
    }

    getWords() {
        return this.words;
    }
}

module.exports = {
    Number : Number
}