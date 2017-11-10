"use strict";
let Dialog = require('./dialog');
let async = require("asyncawait/async");
let await = require("asyncawait/await");
let HelloIntent = require('../intents/hello/hello-intent');
let Request = require('../utils/request');
const googleAPIkey = 'AIzaSyC2atcNmGkRy3pzTskzsPbV6pW68qe_drY'

class HelloDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new HelloIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            // case 1: this.askLocation(senderId); break;
            case 1: this.showOption(input, senderId); break;
            case 2: this.end(); break;
            default: this.end(); break;
        }
    }

    /**
     * Step 1
     * @param {*} senderId 
     */
    // askLocation(senderId) {
    //     this.step = 2;
    //     this.sendLocation(senderId);
    // }

    /**
     * Step 2
     * @param {*} input 
     * @param {*} senderId 
     */
    showOption(input, senderId) {
        console.log(input)

        // if (input.constructor === Array) {
        //     var coordinates = input[0].payload.coordinates
        //     this.session.coordinates = coordinates;
            
        // }
        var that = this;
        this.getSenderName(senderId).then(function (sender) {
            var result = that.reply(senderId, { "text": "Chào " + that.session.pronoun + ' ' + sender.first_name + ", " + that.session.pronoun + " " + "cần em giúp gì không?" });
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
                    }
                ]
            }]);
        });
        that.step = 2;
        that.continue(input, senderId);
    }

    getName() {
        return "hello dialog";
    }
}

module.exports = HelloDialog;
