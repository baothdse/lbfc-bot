let AskDeliveryIntent = require('../intents/delivery/ask-delivery-intent');
let Dialog = require('./dialog')

class AskDeliveryDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new AskDeliveryIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        switch(this.step) {
            case 1: this.replyDelivery(input, senderId, info); break;
            case 2: this.end(); break;
            default: this.end(); break;
        }
    }

    replyDelivery(input, senderId, info) {
        console.log("Standing at STEP 1 ASK DELIVERY DIALOG")
        this.step = 2;
        if(info.reply == 'yes') {
            let reply = 'Có nhe ' + this.session.pronoun + '\n' + 'Thường thì sẽ mất khoảng 20p để đặt và giao hàng!\n' + this.session.pronoun + ' có muốn đặt hàng không?'
            //this.sendTextMessage(senderId, reply) 
            this.sendQuickReply(senderId, reply,
            [{
                content_type: "text",
                title: "Đặt hàng",
                payload: "Đặt hàng",
                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
            }, {
                content_type: "text",
                title: "Xem menu",
                payload: "Xem menu",
                image_url: "https://cdn4.iconfinder.com/data/icons/wirecons-free-vector-icons/32/menu-alt-512.png"
            }, {
                content_type: "text",
                title: "Bỏ qua",
                payload: "Bỏ qua",
                image_url: "https://d30y9cdsu7xlg0.cloudfront.net/png/109934-200.png"
            }]
        )     
        }
    }

    getName() {
        return 'Ask Delivery Dialog';
    }
}
module.exports = AskDeliveryDialog;