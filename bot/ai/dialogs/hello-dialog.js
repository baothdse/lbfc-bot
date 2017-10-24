"use strict";

let Dialog = require('./dialog');
let Pattern = require('./entities/pattern');

let async = require("asyncawait/async");
let await = require("asyncawait/await");

class HelloDialog extends Dialog {
    constructor() {
        super();
        this.push();
    }

    push() {
        this.patterns.push(new Pattern("hello", 1));
        this.patterns.push(new Pattern("xin chào", 1));
        this.patterns.push(new Pattern("chao xìn", 1));
        this.patterns.push(new Pattern("halo", 1));
        this.patterns.push(new Pattern("hé lô", 1));
        this.patterns.push(new Pattern("hé nhô", 1));
        this.patterns.push(new Pattern("^hi$", 1));
        this.patterns.push(new Pattern("alo", 1));
        this.patterns.push(new Pattern("^ê$", 1));
        this.patterns.push(new Pattern("ê mày", 1));
        this.patterns.push(new Pattern("chào", 1));
        this.patterns.push(new Pattern("hey", 1));
        this.patterns.push(new Pattern("a ey", 1));
    }

    continue(input, senderId) {
        var sender = await(this.getSenderName(senderId));
        var result = this.reply(senderId, { "text": "Chào " + sender.first_name + ", bạn cần mình giúp gì không?" });
        this.sendTyping(senderId);
        this.sendGenericMessage(senderId, [{
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
        
    }

    getName() {
        return "hello dialog";
    }
}

module.exports = HelloDialog;
