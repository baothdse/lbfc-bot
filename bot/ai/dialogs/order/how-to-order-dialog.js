var Dialog = require('../dialog')

class HowToOrderDialog extends Dialog {
    constructor(session) {
        super(session);
    }

    continue(input, senderId, info = null) {
        console.log("Chạy vô HOW TO ORDER DIALOG")
        console.log("step = " + this.step)
        switch (this.step) {
            case 1: this.replyHowToOrder(senderId); break;
            case 2: this.end(); break;
            default: break;
        }
    }

    replyHowToOrder(senderId) {
        this.step = 2;
        this.sendQuickReply(senderId, `${this.session.pronoun} chọn nút Đặt hàng nè ${this.session.pronoun.toLowerCase()}`,
        [{
            content_type: "text",
            title: "Đặt hàng",
            payload: "Đặt hàng",
            image_url: "https://thumbs.dreamstime.com/b/flat-vector-money-icon-dollar-long-shadow-isolated-white-background-39939483.jpg"
        }])
        this.continue("", senderId);
    }

    getName(){
        return 'how to order dialog'
    }
}

module.exports = HowToOrderDialog;