let Dialog = require('./dialog');
let PostbackShowOrderDetailIntent = require('../intents/orders/postback-show-order-detail-intent');
let Request = require('../utils/request');

class ShowOrderDetailDialog extends Dialog {

    constructor() {
        super();
        this.push();
    }

    push() {
        this.addIntent(new PostbackShowOrderDetailIntent(1, 0));
    }

    pause() {
        --this.step;
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1:
                this.receiveRequest(senderId, info);
                break;
            default:
                this.end();
                break;
        }
    }


    /**
     * 
     */
    receiveRequest(senderId, info) {
        var that = this;
        var orderId = info.orderId;
        new Request().sendGetRequest('/LBFC/Order/GetOrderById', { "id": orderId }, "")
            .then(function(data){
                that.showDetail(senderId, JSON.parse(data));
                that.step = 2;
                that.continue("", senderId, info);
            });
    }


    /*---------------------------------Exception----------------------------- */

    /*---------------------------Special function----------------------------*/
    showDetail(senderId, data) {
        var that = this;
        this.getSenderName(senderId).then(function(sender){
            var recipientName = sender.first_name + " " + sender.last_name;
            var orderNumber = data.Id;
            var total = data.FinalPrice;
            var paymentMethod = data.PaymentMethod;
            var orderUrl = "https://tiki.vn/sales/order/view?code=75179106"
            var address = {
                street_1: data.Address,
                // street_2: "",
                city: "a",
                postal_code: "760000",
                state: "a",
                country: "Vietnam"
            }
            var summary = {
                subtotal: data.FinalPrice,
                shipping_cost: 0.00,
                total_tax: 0.00,
                total_cost: data.FinalPrice
            }
            var adjustments = [
                {
                    name: "abc",
                    amount: 10
                }
            ]
            var elements = []
            for (var i = 0; i < data.OrderDetails.length; i++) {
                var element = {
                    title: data.OrderDetails[i].ProductName,
                    subtitle: "Sản phẩm được làm từ abc xyz",
                    quantity: data.OrderDetails[i].Quantity,
                    price: data.OrderDetails[i].Price,
                    currency: "VND",
                    image_url: "",
                }
                elements.push(element)
            }
            that.sendReceipt(senderId, recipientName, orderNumber, paymentMethod, orderUrl, address, summary, adjustments, elements)
        });
    }

    getName() {
        return 'show order detail dialog';
    }
}

module.exports = ShowOrderDetailDialog