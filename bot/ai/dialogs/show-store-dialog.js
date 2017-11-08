let Dialog = require('./dialog');

let ShowStoreIntent = require('../intents/store/show-store-intent')

class ShowStoreDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new ShowStoreIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        console.log("===STANDING AT SHOW STORE DIALOG===");
        switch(this.step) {
            case 1: this.showStore(input, senderId, info); break;
            case 2: this.end();
            default: this.end();
        }
    }

    showStore(input, senderId, info) {
        let that = this;
        this.step = 2;
        if (info.listStore) {
            for (var i = 0; i < info.listStore.length; i++) {
                console.log(info.listStore[i])
                
            }
        }
    }

    getName() {
        return 'show store dialog';
    }
}
module.exports = ShowStoreDialog;