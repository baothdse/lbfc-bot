let Dialog = require('./dialog');
let Request = require('../utils/request');

class ShowMenuDialog extends Dialog {
    constructor() {
        super();
    }

    continue(input, senderId) {
        switch (this.step) {
            case 1:
                this.showMenu(senderId);
                break;
            default:
                break;
        }
    }

    showMenu(senderId) {
        var url = '/LBFC/Store/GetStoreMenu';
        var params = {
            'storeId' : 36,
            'skip': 0,
        }
        var that = this;
        this.sendTyping(senderId);
        new Request().sendGetRequest(url, params, "")
            .then(function(data){
                that.getDataAndResponse(data, senderId);
                that.end(senderId);
            });
    }

    getDataAndResponse(data, senderId) {
        console.log("data == " + data);
        var result = JSON.parse(data);
        console.log("result == " + result);
        var that = this;
        result.Products.forEach(function(element) {
            that.reply(senderId, {'text' : element.ProductName + ''});
        }, this);
    }

    getName() {
        return "show menu dialog";
    }
}

module.exports = ShowMenuDialog