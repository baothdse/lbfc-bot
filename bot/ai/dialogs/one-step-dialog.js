let Dialog = require('./dialog');
let Request = require('../utils/request');
let AskForDeliveryTimeIntent = require('../intents/orders/ask-for-delivery-time-intent');
const ThankyouIntent = require('../intents/thank-you-intent')

const ConsoleLog = require('../utils/console-log');

class OneStepDialog extends Dialog {
    constructor(session) {
        super(session);
        this.addIntent(new AskForDeliveryTimeIntent(1, 0));
        this.addIntent(new ThankyouIntent(2, 0));
        this.error = 0;
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1:
                this.responseDeliveryTime(senderId);
                break;
            case 2: this.responseThankyou(senderId); break;
            default:
                this.end();
                break;
        }
    }

    /**
     * Ask for delivery time
     * @param {*} senderId 
     */
    responseDeliveryTime(senderId) {
        this.sendTextMessage(senderId, `Bên em sẽ giao hàng từ 15-30p nha ${this.session.pronoun.toLowerCase()}`)
        .then((response) => {
            this.sendTextMessage(senderId, `Tùy địa điểm giao hàng`);
        })
        this.step = 999;
        this.continue('', '');
    }

    responseThankyou(senderId) {
        this.sendTextMessage(senderId, `Hí hí`)
        .then((res) => {
            return this.sendTextMessage(senderId, `Hông có chi ${this.session.pronoun.toLowerCase()}`);
        })
        .then((res) => {
            this.sendTextMessage(senderId, `:3`);
        })
        this.step = 999;
        this.continue('', '');
    }

    /*-----------------Error-----------------*/
    askForCoordinates(senderId) {
        this.sendLocation(senderId);
        this.step = -1;
        this.error = 2;
    }

    receiveCoordinates(input, senderId) {
        this.session.coordinates = input[0].payload.coordinates;
        this.step = 2;
        this.error = 0;
        this.continue('ok', senderId);
    }

    getName() {
        return "show membership event dialog";
    }
}

module.exports = OneStepDialog