let Dialog = require('./dialog');

let ShowMyOrderHistory = require('../intents/orders/show-my-order-history-intent');
let ShowMyOrderInDate = require('../intents/orders/show-my-order-in-date-intent');

let Request = require('../utils/request');
let ConsoleLog = require('../utils/console-log');
let DateParser = require('../utils/date-parser');


class ShowOrderHistoryDialog extends Dialog {

    constructor(session){
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new ShowMyOrderHistory(1, 0));
        this.addIntent(new ShowMyOrderInDate(0, 1));
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
        new Request().sendGetRequest("/LBFC/User/GetUserOrderHistory?", {"facebookId" : senderId}, "")
        .then(function(dataStr) {
            var data = JSON.parse(dataStr);
            
            that.showOrder(data, senderId);
            that.step = 2;
        })
        .catch();
    } 

    /*--------------------------------------Exception---------------------------------*/
    
    /**
     * Trigger khi user ghi rõ muốn xem order ngày nào
     * @param {string} input 
     * @param {number} senderId 
     * @param {Info} info Ngày mà user muốn xem
     */
    receiveDateRequest(input, senderId, info) {
        var that = this;
        if (info.date == null) {
            this.sendTextMessage(senderId, "Xin hãy nhập ngày hợp lệ")
            .then(function(data){
                that.step = 2;
            });
        } else {
            console.log("date = " + info.date);
            new Request().sendGetRequest("/LBFC/User/GetUserOrderInDate", {"facebookId" : senderId, "date" : info.date}, "")
            .then(function(data){
                that.showOrder(JSON.parse(data), senderId);
                that.step = 2;
            });

        }
    }

    /*-----------------------------Hàm riêng, không thuộc step hoặc exception----------------------*/

    /**
     * Show history ra cho người ta
     * @param {Data} data data trả về từ hàm GetUserOrderHistory của server
     * @param {number} senderId 
     */
    showOrder(data, senderId) {
        var that = this;
        data.forEach(function(element) {
            var str = "Ngày đặt hàng: " + DateParser.format(element.DateOrder) + "\n Tổng đơn hàng: " + element.FinalPrice;
            var buttons = [
                {
                    title: "Xem chi tiết",
                    type: 'postback',
                    payload: "order see_detail $" + element.Id
                },
                {
                    title: "Xóa đơn hàng",
                    type: "postback",
                    payload: "order delete $" + element.Id
                }
            ]
            that.sendButtonMessage(senderId, str, buttons);
            
        }, this);
        
    }

    getName() {
        return "show order history dialog";
    }

}

module.exports = ShowOrderHistoryDialog