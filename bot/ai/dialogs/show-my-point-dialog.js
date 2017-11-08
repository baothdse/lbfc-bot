let Dialog = require('./dialog');

let ShowMyPointIntent = require('../intents/points/show-my-point-intent');

let Request = require('../utils/request');
let ConsoleLog = require('../utils/console-log');
let DateParser = require('../utils/date-parser');



class ShowMyPointDialog extends Dialog {

    constructor(session){
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new ShowMyPointIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 0: this.continueException(input, senderId, info); break;
            case 1: this.receiveRequest(input, senderId); break;
            case 2: this.end(); break;
        }
    }

    continueException(input, senderId, info = null) {
        switch(this.exception) {
            case 1: this.receiveDateRequest(input, senderId, info); break;
        }
    }

    /**
     * Step 1:
     * @param {string} input 
     * @param {number} senderId 
     */
    receiveRequest(input, senderId) {
        var that = this;
        new Request().sendGetRequest("/LBFC/User/GetUserPoint?", {"facebookId" : senderId}, "")
        .then(function(dataStr) {
            this.sendTextMessage(senderId, "Số điểm hiện tại: " + dataStr);
            that.step = 2;
            that.continue(input, senderId);
        })
        .catch();
    } 

    /*--------------------------------------Exception---------------------------------*/
    

    /*-----------------------------Hàm riêng, không thuộc step hoặc exception----------------------*/

    

    getName() {
        return "show my point dialog";
    }

}

module.exports = ShowMyPointDialog