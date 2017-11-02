let Dialog = require('./dialog');
let Request = require('../utils/request');

class ShowMenuDialog extends Dialog {
    constructor(session) {
        super(session);
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1:
                this.showMenu(senderId);
                break;
            case 2: this.end(); break;
            default:
                break;
        }
    }

    showMenu(senderId) {
        var url = '/LBFC/Store/GetStoreMenu';
        var params = {
            'storeId': 36,
            'skip': 0,
        }
        var that = this;
        this.sendTyping(senderId);
        new Request().sendGetRequest(url, params, "")
            .then(function (data) {
                that.getDataAndResponse(data, senderId);
                that.end(senderId);
            });
    }

    getDataAndResponse(data, senderId) {
        console.log("data == " + data);
        var result = JSON.parse(data);
        console.log("result == " + result);
        var that = this;
        result.Products.forEach(function (element) {
            that.reply(senderId, { 'text': element.ProductName + '' });
        }, this);
        this.step = 2;
        this.continue("", "");
    }

    getName() {
        return "show menu dialog";
    }
}

module.exports = ShowMenuDialog