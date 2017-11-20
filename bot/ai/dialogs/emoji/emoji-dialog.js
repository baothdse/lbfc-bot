let EmojiIntent = require('../../intents/emoji/emoji-intent');
let Dialog = require('../dialog');

class EmojiDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new EmojiIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        console.log("=====STANDING AT EMOJI DIALOG ====");
        console.log("STEP = " + this.step);
        switch (this.step) {
            case 1: this.responseEmoji(input, senderId); break;
            case 2: this.end(); break;
            default: this.end();
        }
    }

    responseEmoji(input, senderId) {
        this.step = 2;
        this.sendEmoji(senderId);
        this.continue(input, senderId);
    }

    getName() {
        return "Emoji Dialog";
    }
}

module.exports = EmojiDialog;
