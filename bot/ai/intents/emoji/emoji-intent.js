let Intent = require('../intent');

class EmojiIntent extends Intent {
    constructor(session) {
        super(session);
        // this.addPatterns(['[:)]'], 1, true, false);
        // this.addPatterns(['[:3]'], 1, true, false);
        // this.addPatterns([/.^[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]\d/], 1, true, false);
        // this.addPatterns(['[:D]'], 1, true, false);
        this.addPatterns(['😬'], 1, true, false);
        this.addPatterns(['😂'], 1, true, false);
        this.addPatterns(['😄'], 1, true, false);
        this.addPatterns(['🙂'], 1, true, false);
        this.addPatterns(['😊'], 1, true, false);
        this.addPatterns(['😉'], 1, true, false);
        this.addPatterns(['😇'], 1, true, false);
        this.addPatterns(['😅'], 1, true, false);
        this.addPatterns(['😋'], 1, true, false);
        this.addPatterns(['😌'], 1, true, false);
        this.addPatterns(['😍'], 1, true, false);
        this.addPatterns(['😘'], 1, true, false);
        this.addPatterns(['😗'], 1, true, false);
        this.addPatterns(['😎'], 1, true, false);
        this.addPatterns(['😛'], 1, true, false);
        this.addPatterns(['😝'], 1, true, false);
        this.addPatterns(['😜'], 1, true, false);
        this.addPatterns(['😚'], 1, true, false);
        this.addPatterns(['😙'], 1, true, false);
        this.addPatterns(['😶'], 1, true, false);
        this.addPatterns(['👍'], 1, true, false);
        //this.addPatterns(['[^^]'], 1, true, false);
        this.addPatterns(['hehe'], 1, true, true);
        this.addPatterns(['hihi'], 1, true, true);
        this.addPatterns(['hoho'], 1, true, true);
        this.addPatterns(['haha'], 1, true, true);
        this.addPatterns(['lol'], 1, true, true);
        this.addPatterns(['hê hê'], 1, true,true);
        this.addPatterns(['hi hi'], 1, true,true);
        this.addPatterns(['hí hí'], 1, true,true);   
        this.addPatterns(['hô hô'], 1, true,true);   
    }

    getResult(input, match, which, pattern) {
        console.log('====STANDING AT EMOJI INTENT=====')
        console.log(input)
        console.log(match)
        console.log(pattern)
        let result = null;
        switch(which) {
            case 1: result = this.matchPattern1(input, match, pattern); break;
            default: break;
        }
        return result;
    }

    matchPattern1(input, match, pattern) {
        return {
            step: this.step,
            exception: this.exception
        }
    }
}
module.exports = EmojiIntent;