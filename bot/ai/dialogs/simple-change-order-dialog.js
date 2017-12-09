let Dialog = require('./dialog');
const ConsoleLog = require('../utils/console-log');
const Enums = require('../enum');
const Request = require('../utils/request');

class SimpleChangeOrderDialog extends Dialog {
    constructor(session) {
        super(session);
        if (this.session.simpleChangeOrderDialog == undefined) {
            this.session.simpleChangeOrderDialog = {
                currentProductId: 0,
                newQuantity: 0,
            }
        }
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1: this.receiveProduct(input, senderId, info); break;
            case 2: this.askForNewQuantity(input, senderId, info); break;
            case 3: this.receiveNewQuantity(input, senderId, info); break;
            case 4: this.thankyou(input, senderId, info); break;
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
            this.session.simpleChangeOrderDialog.currentProductId = info.productId;
            this.step = 2;
            this.continue(input, senderId, info);
        } else {
            this.sendTextMessage(senderId, `${this.session.pronoun} ơi, ${this.session.pronoun} mở giỏ hàng lên rồi hãy bấm nút sửa nha.`);
            this.step = 5;
            this.continue('', '');
        }
    }

    askForNewQuantity(input, senderId, info) {
        this.sendTextMessage(senderId, `${this.session.pronoun} muốn sửa thành mấy phần?`);
        this.step = 3;
    }

    /**
     * Step 3
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} info 
     */
    receiveNewQuantity(input, senderId, info) {
        this.step = 4;
        if (!input.match(/\d+/i)) {
            this.remindNumber(2, senderId);
        } else {
            if (input <= 0) {
                this.remindGreaterThanZero(2, senderId);
            } else {
                this.session.simpleChangeOrderDialog.newQuantity = input;
                this.step = 4;
                this.continue(input, senderId, info);
            }
        }
    }

    thankyou(input, senderId, info) {
        let orderDetails = this.session.orderDialog.orderDetails;
        let productName = "";
        orderDetails.some((detail) => {
            if (detail.productID == this.session.simpleChangeOrderDialog.currentProductId) {
                detail.quantity = this.session.simpleChangeOrderDialog.newQuantity;
                productName = detail.productName;
                return true;
            }
        });
        this.sendTextMessage(senderId, `Ok đã chuyển thành ${this.session.simpleChangeOrderDialog.newQuantity} phần ${productName}`);
        this.step = 5;
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
        return 'simple change order dialog';
    }
}
module.exports = SimpleChangeOrderDialog;