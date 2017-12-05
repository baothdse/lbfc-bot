let Dialog = require('./dialog');
let await = require('asyncawait/await')
const Request = require('../utils/request');

class ShowStoreDialog extends Dialog {
    constructor(session) {
        super(session);
    }

    continue(input, senderId, info = null) {
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
        this.sendTextMessage(senderId, 'Hiện tại hệ thống tụi em có các cửa hàng sau')
            .then((response) => {
                this.getStore()
                .then((info) => {
                        let condition = info.length;
                        for (var i = 0; i < condition; i++) {
                            // console.log(info.listStore[i])
                            reply += '-' + info[i].Name + '\n'
                            if (i % 10 == 0 || i == condition - 1) {
                                this.sendTextMessage(senderId, reply);
                                reply = "";
                            }
                        }
                })
            })
    }

    getStore() {
        return new Request().sendGetRequest('/LBFC/Store/GetAllStoresByBrand', { 'brandId': this.session.brandId }, '')
            .then((data) => {
                let listStore = JSON.parse(data);
                return listStore;
            })
    }

    getName() {
        return 'show store dialog';
    }
}
module.exports = ShowStoreDialog;