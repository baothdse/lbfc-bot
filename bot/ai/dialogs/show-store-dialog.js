let Dialog = require('./dialog');
let await = require('asyncawait/await')
let ShowStoreIntent = require('../intents/store/show-store-intent')
const Request = require('../utils/request');

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
        switch (this.step) {
            case 1: this.showStore(input, senderId, info); break;
            case 2: this.end();
            default: this.end();
        }
    }

    showStore(input, senderId, info) {
        let that = this;
        this.step = 2;
        let reply = "";
        this.sendTextMessage(senderId, 'Hiện tại hệ thống chúng tôi có các cửa hàng sau')
            .then((response) => {
                this.getStore()
                .then((info) => {
                    if (info.listStore) {
                        let condition = info.listStore.length;
                        for (var i = 0; i < condition; i++) {
                            // console.log(info.listStore[i])
                            reply += '-' + info.listStore[i].Name + '\n'
                            if (i % 10 == 0 || i == condition - 1) {
                                this.sendTextMessage(senderId, reply);
                                reply = "";
                            }
                        }
                    }
                })
            })
    }

    getStore() {
        return new Promise((resolve, reject) => {
            new Request().sendGetRequest('/LBFC/Store/GetAllStoresByBrand', { 'brandId': 1 }, '')
            .then((data) => {
                let listStore = JSON.parse(data);
                return listStore;
            })
        })
    }

    getName() {
        return 'show store dialog';
    }
}
module.exports = ShowStoreDialog;