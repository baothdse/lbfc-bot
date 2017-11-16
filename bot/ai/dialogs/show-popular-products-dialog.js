let Dialog = require('./dialog');

let ShowTopProductIntent = require('../intents/products/search-popular-product-intent');

let Request = require('../utils/request');
let ConsoleLog = require('../utils/console-log');
let DateParser = require('../utils/date-parser');


class ShowOrderHistoryDialog extends Dialog {

    constructor(session){
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new ShowTopProductIntent(1, 0));
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
        new Request().sendGetRequest("/LBFC/Product/GetTopProduct", {"brandId" : this.session.brandId}, "")
        .then((dataStr) => {
            var data = JSON.parse(dataStr);
            this.sendTextMessage(senderId, `Bên em thì thường khách kêu mấy món này nè ${this.session.pronoun}`)
            .then((response) => {
                that.showProducts(data, senderId);
                that.step = 2;
                this.continue('', senderId);
            })
        })
        .catch((err) => {
            ConsoleLog.log(err, this.getName(), 53);
        });
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
    showProducts(data, senderId) {
        var that = this;
        let elements = [];
        data.forEach((d) => {
            var element = {
                title: d.ProductName,
                image_url: d.PicURL,
                subtitle: d.ProductName,
                default_action: {
                    "type": "web_url",
                    "url": "https://foody.vn",
                    "messenger_extensions": true,
                    "webview_height_ratio": "tall"
                },
                buttons: [
                    {
                        type: "postback",
                        title: "Đặt sản phẩm",
                        payload: "Đặt $" + d.ProductID + " $" + d.ProductName + " $" + d.Price + " $" + d.PicURL + " $" + d.ProductCode + " $" + this.session.brandId,
                    }
                ]
            }
            elements.push(element);
        }, this);
        this.sendGenericMessage(senderId, elements);
    }

    getName() {
        return "show order history dialog";
    }

}

module.exports = ShowOrderHistoryDialog