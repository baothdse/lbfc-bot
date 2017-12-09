var Dialog = require('../dialog')

class AskBookingDialog extends Dialog {
    constructor(session) {
        super(session);
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1: this.replyBooking(senderId); break;
            case 2: this.end(); break;
            default: break;
        }
    }

    replyBooking(senderId) {
        this.step = 2;
        this.sendTextMessage(senderId, `Hiện tại em không giúp ${this.session.pronoun.toLowerCase()} đặt bàn được. ${this.session.pronoun} vui lòng gọi điện đến cửa hàng để được hỗ trợ! Em xin cảm ơn!`)
        this.continue("", senderId);
    }

    getName() {
        return "ask booking dialog";
    }
}

module.exports = AskBookingDialog;