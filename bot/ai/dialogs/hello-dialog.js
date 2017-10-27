"use strict";

let Dialog = require('./dialog');

let async = require("asyncawait/async");
let await = require("asyncawait/await");

let HelloIntent = require('../intents/hello/hello-intent');

class HelloDialog extends Dialog {
    constructor() {
        super();
        this.push();
    }

    push() {
        this.addIntent(new HelloIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1: this.askLocation(senderId); break;
            case 2: this.showOption(input, senderId); break
        }
    }

    askLocation(senderId) {
        this.step = 2;
        this.sendLocation(senderId);
    }

    showOption(input, senderId) {
        console.log(input)
        var that = this;
        this.getSenderName(senderId).then(function(sender){
            var result = that.reply(senderId, { "text": "Chào " + sender.first_name + ", bạn cần mình giúp gì không?" });
            that.sendTyping(senderId);
            that.sendGenericMessage(senderId, [{
                title: "Chào mừng " + sender.first_name + " đến với LBFC",
                image_url: "https://images.unsplash.com/photo-1471691170738-9c6b554ebec1",
                subtitle: "Vui lòng chọn option bên dưới để chúng tôi có thể giúp bạn 1 cách tốt nhất",
                default_action: {
                    "type": "web_url",
                    "url": "https://foody.vn",
                    "messenger_extensions": true,
                    "webview_height_ratio": "tall"
                },
                buttons: [
                    {
                        type: "postback",
                        title: "Tìm sản phẩm",
                        payload: "Tìm sản phẩm"
                    },
                    {
                        type: "postback",
                        title: "Khuyến mãi",
                        payload: "Khuyến mãi"
                    },
                    {
                        type: "postback",
                        title: "Nhãn hiệu",
                        payload: "Nhãn hiệu"
                    }
                ]
            }]);
        });
    }

    getName() {
        return "hello dialog";
    }
}

module.exports = HelloDialog;
