"use strict";

let Dialog = require('./dialog');

class HelpDialog extends Dialog {
    constructor() {
        super();
        this.push();
    }

    push() {
        this.patterns.push(new Pattern("help", 1));
        this.patterns.push(new Pattern("cứu tôi", 1));
        this.patterns.push(new Pattern("trợ giúp", 1));
        this.patterns.push(new Pattern("tôi không hiểu", 1));
        this.patterns.push(new Pattern("tôi cũng không hiểu", 1));
        this.patterns.push(new Pattern("tôi hiểu rồi", 2));
        this.patterns.push(new Pattern("hiểu rồi", 2));
    }

    continue(input,senderId) {
        console.log("help dialog status = " + this.status);
        //var result = this.reply(senderId, {"text" : "Bạn cần giúp gì"})
        switch(this.step) {
            case 1: this.getHelp(senderId); break;
            case 2: this.end(); break;
            default: break;

        }
    }

    getHelp(senderId) {
        this.step = 2;
        this.reply(senderId, {'text' : 'Bạn cần mình giúp gì không nè?'});
    }

    getName() {
        return "help dialog";
    }

}

module.exports = HelpDialog;