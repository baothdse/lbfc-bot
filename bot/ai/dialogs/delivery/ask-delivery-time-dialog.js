let AskDeliveryTimeIntent = require('../../intents/delivery/ask-delivery-time-intent')
let Dialog = require('../dialog');


class AskDeliveryTimeDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new AskDeliveryTimeIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        console.log("=====STANDING AT ASK DELIVERY TIME DIALOG ====");
        console.log("STEP = " + this.step);
        switch (this.step) {
            case 1: this.answerDeliveryTime(input, senderId); break;
            case 2: this.end();
            default: this.end();
        }
    }

    /**
     * Dùng để trả lời thời gian giao hàng
     * @param {*} input 
     * @param {*} senderId 
     */
    answerDeliveryTime(input, senderId) {
        this.step = 2;
        var listReplies = ['Khoảng 30p nhen ' + this.session.pronoun.toLowerCase() + '😅' ,'Tầm 30p đổ lại đó ' + this.session.pronoun.toLowerCase() + '😅',
         'Bọn em giao trong khoảng 30p!😅']
        let replyText = this.randomReplyMessage(listReplies);
        this.sendTextMessage(senderId, replyText);
        this.continue(input, senderId)
    }

    /**
     * Step này dùng để nhận thông tin từ user có muốn xem thời gian đóng mở cửa của tất cả cửa hàng hay không.
     * Next step : showOpenCloseTimeOfStore() hoặc end()
     * @param {*} input 
     * @param {*} senderId 
     */
    // receiveUserAction(input, senderId) {
    //     if(input.match(/(xem hết|xem tất cả|tất cả)/i)) {
    //         this.step = 3;
    //     } else {
    //         this.step = 4;
    //         this.continue(input, senderId);
    //     }
    // }

    getName() {
        return "Ask Delivey Time Dialog";
    }
}

module.exports = AskDeliveryTimeDialog;