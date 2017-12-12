let Dialog = require('./dialog');
const ConsoleLog = require('../utils/console-log');
const Enums = require('../enum');
const Request = require('../utils/request');

class SimpleDeleteOrderDialog extends Dialog {
    constructor(session) {
        super(session);
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1: this.receiveProduct(input, senderId, info); break;
            case 2: this.thankyou(input, senderId, info); break;
            default: this.end();
        }
    }

    /**
     * 
     * @param {*} input 
     * @param {*} senderId 
     * @param {{productId: number}} info 
     */
    receiveProduct(input, senderId, info) {
        if (info.productId != undefined) {
            let orderDetails = this.session.orderDialog.orderDetails;
            let productName = "";
            for(var i = 0; i < orderDetails.length; ++i) {
                if (orderDetails[i].productID == info.productId) {
                    productName = orderDetails[i].productName;
                    orderDetails.splice(i, 1);
                    break;
                }
            }
            this.step = 2;
            this.continue(productName, senderId, info);
        } else {
            this.sendTextMessage(senderId, `${this.session.pronoun} ơi, ${this.session.pronoun} mở giỏ hàng lên rồi hãy bấm nút sửa nha.`);
            this.step = 5;
            this.continue('', '');
        }
    }

    thankyou(input, senderId, info) {
        this.sendTextMessage(senderId, `Ok đã xóa ${input}`);
        this.step = 3;
        this.continue('', '');
    }

    /*----------------------------------------------------------------------------------*/
    remindNumber(step, senderId) {
        this.sendTextMessage(senderId, `${this.session.pronoun} nhập số lớn hơn 0 nha anh.`)
        .then((res) => {
            this.step = step;
            this.continue('', senderId, undefined);
        });
    }

    remindGreaterThanZero(step, senderId) {
        this.sendTextMessage(senderId, `${this.session.pronoun} nhập số lớn hơn 0 nha anh.`)
        .then((res) => {
            this.step = step;
            this.continue('', senderId, undefined);
        });
    }

    getName() {
        return 'simple delete order dialog';
    }
}
module.exports = SimpleDeleteOrderDialog;