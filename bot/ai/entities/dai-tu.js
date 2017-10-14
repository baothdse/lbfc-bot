"use strict";
 class DaiTu {
    constructor(){
        this.words = [];
        this.words.push("tôi");
        this.words.push("tui");
        this.words.push("mình");
        this.words.push("tớ");
        this.words.push("em");
        this.words.push("chị");
        this.words.push("anh");
        this.words.push("tao");

    }

    getWords() {
        return this.words;
    }
}


module.exports = {
    DaiTu: DaiTu,
}