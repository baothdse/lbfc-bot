let Dialog = require('./dialog');
let Request = require('../utils/request');
let ShowMenuIntent = require('../intents/menus/show-menu-intent');

class ShowMenuDialog extends Dialog {
    constructor(session) {
        super(session);
        this.addIntent(new ShowMenuIntent(1, 0));
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
        var skip = Math.floor(Math.random() * 70);
        var url = '/LBFC/Brand/GetMenu';
        var params = {
            'brandId': this.session.brandId,
            'skip': skip,
        }
        var that = this;
        this.sendTyping(senderId);
        new Request().sendGetRequest(url, params, "")
            .then(function (data) {
                that.getDataAndResponse(data, senderId);
            });
        that.step = 2;
        that.continue("", "");
    }

    getDataAndResponse(dataStr, senderId) {
        var data = JSON.parse(dataStr);
        var elements = [];
        data.forEach((d) => {
            var element = {
                title: d.ProductName,
                image_url: d.PicURL,
                subtitle: d.Price,
                default_action: {
                    "type": "web_url",
                    "url": "https://foody.vn",
                    "messenger_extensions": true,
                    "webview_height_ratio": "tall"
                },
                buttons: [
                    {
                        type: "postback",
                        title: "Đặt sản phẩm",
                        payload: "Đặt $" + d.ProductID + " $" + d.ProductName + " $" + d.Price + " $" + d.PicURL + " $" + d.ProductCode + " $" + this.session.brandId,
                    }, {
                        type: "postback",
                        title: "Xem tiếp",
                        payload: "Xem menu"
                    }
                ]
            }
            elements.push(element);
        });
        this.sendGenericMessage(senderId, elements);
        this.step = 2;
        this.continue("", "");
    }

    getName() {
        return "show menu dialog";
    }
}

module.exports = ShowMenuDialog