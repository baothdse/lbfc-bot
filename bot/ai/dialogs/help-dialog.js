"use strict";

let Dialog = require('./dialog');
let Pattern = require('./entities/pattern');
let Response = require('./entities/response');

class HelpDialog extends Dialog {
    constructor() {
        super();
        this.push();
    }

    push() {
        this.patterns.push(new Pattern.Pattern("help", 1));
        this.patterns.push(new Pattern.Pattern("cứu tôi", 1));
        this.patterns.push(new Pattern.Pattern("trợ giúp", 1));
        this.patterns.push(new Pattern.Pattern("tôi không hiểu", 1));
        this.patterns.push(new Pattern.Pattern("tôi cũng không hiểu", 1));
        this.patterns.push(new Pattern.Pattern("tôi hiểu rồi", 2));
        this.patterns.push(new Pattern.Pattern("hiểu rồi", 2));
    }

    continue(input) {
        console.log("help dialog status = " + this.status);
        var result = new Response.Response("tôi không hiểu", true);
        switch(this.step) {
            case 1: result = this.getHelp(); break;
            case 2: result = this.end(); break;
            default: break;

        }
        return result;
    }

    getHelp() {
        return new Response.Response("Bạn có thể nhập \"tôi muốn mua 2 ly cà phê\". Bạn đã hiểu chưa?", true);
    }

    getName() {
        return "help dialog";
    }

}

module.exports = {
    HelpDialog : HelpDialog,
}