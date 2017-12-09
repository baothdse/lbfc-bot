let Dialog = require('./dialog');
let async = require("asyncawait/async");
let await = require("asyncawait/await");
let Request = require('../utils/request');
const googleAPIkey = 'AIzaSyC2atcNmGkRy3pzTskzsPbV6pW68qe_drY';

class ShowCartDialog extends Dialog {
    constructor(session) {
        super(session);
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            // case 1: this.askLocation(senderId); break;
            case 1: this.showCart(input, senderId, info); break;
            default: this.end(); break;
        }
    }

    showCart(input, senderId, info) {
        this.step = 2;
        if (this.session.orderDialog == undefined) {
            this.sendTextMessage(senderId, `${this.session.pronoun} chưa đặt hàng mà`);
            this.end();
            return;
        }
        let orderDetails = this.session.orderDialog.orderDetails;
        let elements = [];
        orderDetails.forEach((orderDetail) => {
            let element = {
                title: orderDetail.productName,
                image_url: orderDetail.picURL,
                subtitle: `Số lượng: ${orderDetail.quantity}
                            Đơn giá: ${orderDetail.price}`,
                buttons: [
                    {
                        "type": "postback",
                        "title": "Sửa số lượng",
                        "payload" : `order_detail edit ${orderDetail.productID}`
                    },
                    {
                        "type": "postback",
                        "title": "Xóa sản phẩm",
                        "payload" : `order_detail delete ${orderDetail.productID}`
                    },
                ]
            };

            elements.push(element);
        });
        this.sendTextMessage(senderId, `Đơn hàng của ${this.session.pronoun.toLowerCase()} đây ạ`)
        .then((res) => {
            this.sendGenericMessage(senderId, elements);

        });
        this.continue('', '');
    }

    getName() {
        return "show cart dialog";
    }
}

module.exports = ShowCartDialog;
