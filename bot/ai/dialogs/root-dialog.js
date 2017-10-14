
let Dialog = require('./dialog');
let Response = require('./entities/response');

class RootDialog extends Dialog {
    constructor(){
        super();

    }

    continue(input) {
        return new Response.Response("Xin chào, tôi là teek", true);
    }
}

module.exports = RootDialog