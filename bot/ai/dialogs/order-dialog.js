

var Order = require('./entities/order');
var response = require('./entities/response');
let Dialog = require('./dialog');
let Pattern = require('../intents/patterns/pattern');
let ClassParser = require('../utils/class-parser');
let Request = require('../utils/request');
let ConsoleLog = require('../utils/console-log');

/*-------------------Import intents-------------------*/
let ReceiveFullOrderIntent = require('../intents/orders/receive-full-order-intent');
let BeginOrderIntent = require('../intents/orders/begin-order-intent');
let PostbackOrderIntent = require('../intents/orders/postback-order-intent');
/*----------------------------------------------------*/

/*-------------------Template-------------------------*/
let SimpleTextTemplate = require('./templates/simple-text-template');
let ButtonTemplate = require('./templates/button-template');

class OrderDialog extends Dialog {
    constructor() {
        super();
        this.orders = [];
        this.tmpOrder = new Order();
        this.push();
    }

    push() {
        this.addIntent(new ReceiveFullOrderIntent(0, 1));
        this.addIntent(new BeginOrderIntent(2, 0));
        this.addIntent(new PostbackOrderIntent(0, 2));
    }

    continue(input, senderId, info = null) {
        console.log("đang ở order dialog")
        console.log(input);
        console.log("Standing at STEP ====== " + this.step)
        switch (this.step) {
            case 0: this.continueException(input, senderId, info); break;
            case 1: this.receiveRequire(input, senderId); break;
            case 2: this.askForProduct(senderId); break;
            case 3: this.receiveProduct(input, senderId); break;
            case 4: this.askForQuantity(senderId); break;
            case 5: this.receiveQuantity(input, senderId); break;
            case 6: this.askForMore(senderId); break;
            case 7: this.receiveMoreProduct(input, senderId); break;
            case 8: this.askOrderType(input, senderId); break;
            case 9: this.receiveOrderType(input, senderId); break;
            case 10: this.askForConfimation(input, senderId); break;
            case 11: this.receiveConfirmation(input, senderId); break;
            case 12: this.end(); break;
            default: break;
        }
    }


    /**
     * Xử lý các tình huống user nhập tắt, không theo từng bước
     * @param {string} input input của user
     * @param {int} senderId 
     * @param {any} info thông tin trích xuất được từ intent
     */
    continueException(input, senderId, info = null) {
        switch (this.exception) {
            case 1:
                this.receiveFullOrder(input, senderId, info);
                break;
            case 2:
                this.receiveProductFromPostback(input, senderId, info);
                break;
            default:
                break;
        }
    }

    end() {
        this.orders = [];
        this.status = 'end';
    }

    receiveRequire(input, senderId) {
        this.step = 2;
        this.continue(input, senderId);
    }


    askForProduct(senderId) {
        this.step = 3;
        var buttons = [
            {
                'type': 'postback',
                'title': 'Xem menu',
                'payload': 'Xem menu',
            }
        ];
        this.reply(senderId, new ButtonTemplate('Bạn muốn gọi món gì?', buttons).template);

    }


    /**
     * Nhận tên của sản phẩm user muốn order
     * @param {string} input tên của sản phẩm
     * @param {*} senderId 
     */
    receiveProduct(input, senderId) {
        var that = this;
        this.sendTyping(senderId);

        new Request().sendGetRequest('/LBFC/Store/GetProductInStoreByName', { 'storeId': '36', 'name': input }, "")
            .then(function (data) {
                if (data == null || data.length == 0) {
                    that.reply(senderId, new SimpleTextTemplate("Quán không có bán món đó ạ").template);
                    that.step = 2;
                } else {
                    var result = JSON.parse(data);
                    that.session.push({ 'productId': result.ProductId, 'productName': result.ProductName });
                    that.step = 4;
                }
                that.continue(input, senderId);

            });
    }

    /**
     * Step 4: Hỏi user số lượng muốn đặt
     * @param {int} senderId 
     */
    askForQuantity(senderId) {
        this.step = 5;
        this.reply(senderId, new SimpleTextTemplate('Bạn muốn mua bao nhiêu phần?').template);
    }


    /**
     * Nhận số lượng món hàng mà user muốn.
     * Current step = 5.
     * Cú pháp: \\d+
     * @param {string} input Số phần mà user nhập vào
     * @param {int} senderId id fb của user
     */
    receiveQuantity(input, senderId) {
        var that = this;
        if (input.match(/^\d+$/g)) {
            this.orders.push(new Order(this.session[0].productId, this.session[0].productName, input));
            this.step = 6;
            this.reply(senderId,
                new SimpleTextTemplate('Ok ' + input + ' phần ' + this.session[0].productName).template)
                .then(function (data) {
                    that.session = [];
                    that.continue(input, senderId);
                });
        } else {
            this.requireNumber(4, senderId);
        }
    }


    /**
    * Step 6: Hỏi coi user có muốn đặt nữa hơm
    * @param {number} senderId 
    */
    askForMore(senderId) {
        this.step = 7;
        this.reply(senderId, new SimpleTextTemplate('Bạn muốn gọi thêm món gì không?').template);
    }


    /**
      * Step 7: Nhận xem là user muốn đặt tiếp hay kết thúc
      * @param {string} input 
      * @param {int} senderId 
      */
    receiveMoreProduct(input, senderId) {
        if (input.match(/(hết rồi|hết|không|không còn)/i)) {

            this.step = 8;
            this.continue(input, senderId);
        } else {
            this.step = 2;
            this.continue(input, senderId);
        }
    }


    /**
     * Step 8: Hỏi giao hàng hay tới lấy
     * @param {string} input 
     * @param {number} senderId 
     */
    askOrderType(input, senderId) {
        console.log("đang ở ask order type");
        this.step = 9;

        this.sendQuickReply(senderId, "Vui lòng chọn phương thức nhận hàng?",
            [{
                content_type: "text",
                title: "Tại cửa hàng",
                payload: "Tại cửa hàng",
                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
            }, {
                content_type: "text",
                title: "Delivery",
                payload: "Delivery",
                image_url: "https://cdn1.iconfinder.com/data/icons/transportation-4/512/vespa-512.png"
            }]
        )
    };

    /**
     * Step 9: Nhận xem là user muốn tới lấy hay được giao
     * @param {string} input 
     * @param {number} senderId 
     */
    receiveOrderType(input, senderId) {
        if (input == 'Tại cửa hàng') {
            this.step = 10;
            this.sendTextMessage(senderId, 'ok tới uni space lấy nha');
            this.continue(input, senderId);
        } else {
            this.sendTextMessage(senderId, 'Chức năng đang phát triển');
        }
    }

    /**
     * Step 10: confirm lại order
     * @param {number} senderId 
     */
    askForConfimation(input, senderId) {
        var that = this;
        this.getSenderName(senderId).then(function(sender){
            var recipientName = sender.first_name + " " + sender.last_name;
            var orderNumber = "1234";
            var total = that.calculateTotalPrice(that.orders);
            var paymentMethod = input
            var orderUrl = "https://tiki.vn/sales/order/view?code=75179106"
            var address = {
                street_1: "252 Nguyễn Thị Minh Khai",
                street_2: "",
                city: "Quy Nhơn",
                postal_code: "65789",
                state: "Bình Định",
                country: "US"
            }
            var summary = {
                subtotal: 75.00,
                shipping_cost: 50.00,
                total_tax: 10.00,
                total_cost: total
            }
            var adjustments = [
                {
                    name: "abc",
                    amount: 10
                }
            ]
            var elements = []
            for (var i = 0; i < that.orders.length; i++) {
                var element = {
                    title: that.orders[i].productName,
                    subtitle: "Sản phẩm được làm từ abc xyz",
                    quantity: that.orders[i].quantity,
                    price: that.orders[i].price.trim() + ".00",
                    currency: "VND",
                    image_url: that.orders[i].productUrl
                }
                elements.push(element)
            }
            ConsoleLog.log(elements, 'order-dialog.js', '341');
            that.sendReceipt(senderId, recipientName, orderNumber, paymentMethod, orderUrl, address, summary, adjustments, elements)
            .then(function(data){
                that.sendTextMessage(senderId, 'Đồng ý đặt hàng?');
            });
        });
    }

    /**
     * Step 11: Nhận coi user có đồng ý đặt hàng không
     * @param {string} input 
     * @param {number} senderId 
     */
    receiveConfirmation(input, senderId) {
        if (input == 'ok') {
            this.sendTextMessage(senderId, 'Đã đặt hàng');
            this.step = 12;
        }
    }

    /* ---------------------------Exception-----------------------*/

    /**
     * Xử lý khi user nhập thẳng tên món hàng và số lượng
     * @param {{'productName', 'quantity'}} info gồm productName và quantity
     * @param {int} senderId id fb của user
     */
    receiveFullOrder(input, senderId, info) {
        this.sendTyping(senderId);
        var that = this;

        new Request().sendGetRequest('/LBFC/Store/GetProductInStoreByName',
            { 'storeId': '36', 'name': info.productName }, "")
            .then(function (data) {
                if (data == null || data.length == 0) {
                    var s = "Quán không có bán món đó ạ";
                    that.reply(senderId, new SimpleTextTemplate(s).template);
                    that.step = 2;
                    that.continue(input, senderId);
                } else {
                    var result = JSON.parse(data);
                    that.orders.push(new Order(result.ProductId, result.ProductName, info.quantity));
                    that.step = 6;
                    that.reply(senderId,
                        new SimpleTextTemplate('Ok ' + info.quantity + ' phần ' + info.productName).template)
                        .then(function (data) {
                            that.continue(input, senderId);
                        });
                }
                that.exception = 0;


            }).catch(function (data) {
                console.log('order-dialog.js: 210 ---->' + data);
            });
    }


    /**
     * Xử lý khi nhận postback từ nút đặt hàng 
     * @param {string} input Theo dạng "Đặt {tên sp} {id sp}"
     * @param {int} senderId 
     */
    receiveProductFromPostback(input, senderId, info) {
        this.session.push({ 'productId': info.productId, 'productName': info.productName });
        this.step = 4;
        this.continue(input, senderId);
    }

    /*-------------------------End exception section-----------------------*/    


    /*------------------------------Error handler----------------------- */
    /**
     * Báo lỗi yêu cầu nhập số và quay lại step n
     * @param {int} step Step để trở về sau khi báo lỗi
     * @param {int} senderId 
     */
    requireNumber(step, senderId) {
        var that = this;
        this.reply(senderId, new SimpleTextTemplate('Bạn vui lòng nhập số thôi').template).then(
            function (data) {
                that.step = step;
                that.continue('', senderId);
            }
        );
    }

    /*------------------------ End error handler section-----------------*/

    /*--------------------------Private method----------------------------*/
    calculateTotalPrice(listProduct) {
        var total = 0;
        for (var i = 0; i < listProduct.length; i++) {
            total += (listProduct[i].price * listProduct[i].quantity)
        }
        return total;
    }

    getName() {
        return "order dialog";
    }

}

module.exports = OrderDialog;