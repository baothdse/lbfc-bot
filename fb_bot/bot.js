"use strict";
var SimpleFilter = require("./filters/simpleFilter");
var ButtonFilter = require("./filters/buttonFilter");


var BOT_REPLY_TYPE = require("./constants").BOT_REPLY_TYPE;
var BUTTON_TYPE = require("./constants").BUTTON_TYPE;
var PAYLOAD = require("./constants").PAYLOAD;

var async = require("asyncawait/async");
var await = require("asyncawait/await");

var fbAPI = require("./api/facebookApi");
var util = require("./utilities");

class BotAsync {
    constructor() {
        this._helloFilter = new ButtonFilter(["hi", "halo", "hế nhô", "he lo", "hello", "chào", "xin chào", "helo", "alo", "ê mày"],
            "Chào bạn, mềnh là bot LBFB hiehie, bạn muốn mình giúp gì nào :3", [{
                title: "Nâng cao trình độ",
                type: BUTTON_TYPE.POSTBACK,
                payload: PAYLOAD.TECHNICAL_POST
            }, {
                title: "Tìm hiểu nghề nghiệp",
                type: BUTTON_TYPE.POSTBACK,
                payload: PAYLOAD.CAREER_POST
            }, {
                title: "Các thứ linh tinh",
                type: BUTTON_TYPE.POSTBACK,
                payload: PAYLOAD.GENERIC_POST
            }]);

        this._filters = [this._helloFilter];
    }

    setSender(sender) {
        this._helloFilter.setOutput('Chào ${sender.first_name},');
        //this._goodbyeFilter.setOutput('Tạm biệt ${sender.first_name}, hẹn gặp lại)');
    }

    chat(input) {
        for (var filter of this._filters) {
            if (filter.isMatch(input)) {
                filter.process(input);
                return filter.reply(input);
            }
        }
    }

    reply(senderId, textInput) {
        async(() => {
            var sender = await(fbAPI.getSenderName(senderId));
            this.setSender(sender);

            var botReply = await(this.chat(textInput));
            var output = botReply.output;
            switch (botReply.type) {
                case BOT_REPLY_TYPE.TEXT:
                    fbAPI.sendTextMessage(senderId, output);
                    break;
                // case BOT_REPLY_TYPE.POST:
                //     if (output.length > 0) {
                //         fbAPI.sendTextMessage(senderId, "Bạn xem thử mấy bài này nhé ;)");
                //         fbAPI.sendGenericMessage(senderId, ulti.postsToPayloadElements(output));
                //     }
                //     else {
                //         fbAPI.sendTextMessage(senderId, "Xin lỗi mình không tim được bài nào ;)");
                //     }
                //     break;
                // case BOT_REPLY_TYPE.VIDEOS:
                //     fbAPI.sendTextMessage(senderId, "Có ngay đây. Xem thoải mái ;)");
                //     fbAPI.sendGenericMessage(senderId, ulti.videosToPayloadElements(output));
                //     break;
                // case BOT_REPLY_TYPE.BUTTONS:
                //     let buttons = botReply.buttons;
                //     fbAPI.sendButtonMessage(senderId, output, buttons);
                //     break;
                // case BOT_REPLY_TYPE.IMAGE:
                //     fbAPI.sendTextMessage(senderId, "Đợi tí có liền, đồ dại gái hà ^^");
                //     fbAPI.sendImage(senderId, output);
                //     break;
                default:
            }
        })();
    }
}

module.exports = new BotAsync();