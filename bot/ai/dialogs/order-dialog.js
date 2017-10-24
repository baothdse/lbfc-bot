let Order = require('./entities/order');
let response = require('./entities/response');
let Dialog = require('./dialog');
let Pattern = require('./entities/pattern');
let ClassParser = require('../utils/class-parser');
let Request = require('../utils/request');
let async = require("asyncawait/async");
let await = require('asyncawait/await')

class OrderDialog extends Dialog {
    constructor() {
        super();
        this.orderDetail = [];
        this.tmpOrder = new Order();
        this.push();
    }

    push() {
        this.addPatterns(["DaiTu", "YeuCau", "DatHang"], 1);
        this.addPatterns(["DatHang"], 1);
        this.addPatterns(["DaiTu", "YeuCau", "Number", "DonVi"], 2);
        // this.addPatterns(["End"], 3);

        this.patterns.push(new Pattern("tại cửa hàng", 5));
        this.patterns.push(new Pattern("ok", 4));

    }

    continue(input, senderId) {
        console.log("đang ở order dialog")
        console.log(input);
        console.log("Standing at STEP ====== " + this.step)
        switch (this.step) {
            case 1:
                if (input.type == "text") {
                    this.askForProduct(input.message, senderId); break;
                } else {
                    this.askQuantity(input.message, senderId); break;
                }
                break;
            //case 2.1: this.checkProductName(input.message, senderId);
            case 2: this.askQuantity(input.message, senderId); break;
            case 3: this.askShowMoreOption(input.message, senderId); break;
            case 4: this.askOrderType(input.message, senderId); break;
            case 5: this.askConfirm(input.message, senderId); break;
            // case 6: this.finishOrder(senderId); break;
            // case 7: this.end(senderId); break;
            default: break;
        }
    }

    askForProduct(input, senderId) {
        console.log("đang ở ask product dialog")

        this.step = 2.1;
        var data = await(new Request().sendGetRequest('/LBFC/Product/GetShopHasProductOutdoor', { 'keyword': input }, ""));
        var listProduct = JSON.parse(data);

        var that = this;

        var top4Product = [];
        for (var i = 0; i < 4; i++) {
            var element = {
                title: listProduct[i].Name,
                image_url: listProduct[i].Product.PicURL,
                subtitle: listProduct[i].Product.ProductName,
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
                        payload: "Đặt $" + listProduct[i].Product.ProductID + " $" + listProduct[i].Product.ProductName +  " $" + listProduct[i].Product.Price + " $" + listProduct[i].Product.PicURL,
                    }
                ]
            }
            top4Product.push(element);
        }
        this.reply(senderId, { "text": "Có " + listProduct.length + " sản phẩm với từ khóa " + input })
        this.sendGenericMessage(senderId, top4Product)

    }

    askQuantity(input, senderId) {
        console.log("đang ở ask quantity")
        console.log(input)
        this.step = 3;
        var productDetail = (input.slice(5, input.length)).split("$", 5);
        this.tmpOrder = {
            "productId": productDetail[0],
            "productName": productDetail[1],
            "price": productDetail[2],
            "productUrl": productDetail[3]
        }
        this.reply(senderId, { "text": "Bạn cần đặt bao nhiêu phần?" });
    }

    askShowMoreOption(input, senderId) {
        if (input.match(/\d+/g)) {
            console.log("đang ở ask SHOW MORE")
            this.tmpOrder.quantity = input
            this.orderDetail.push(this.tmpOrder);
            console.log(this.orderDetail)
            this.step = 4;
            this.reply(senderId, { "text": "Bạn có muốn đặt thêm món gì nữa không?" })
        }
    }

    askOrderType(input, senderId) {
        console.log("đang ở ask order type")
        
        if (input == "có" || input == "Ok") {
            this.step = 1;
            this.reply(senderId, { "text": "Vui lòng nhập tên sản phẩm cần order" })
        } else {
            this.step = 5;

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
        }
    }

    calculateTotalPrice(listProduct) {
        var total = 0;
        for (var i = 0; i < listProduct.length; i++) {
            total += (listProduct[i].price * listProduct[i].quantity)            
        }
        return total;
    }
    askConfirm(input, senderId) {
        console.log("đang ở ask CONFIRM")
        this.step = 6;
        this.tmpOrder.orderType = input;
        var that = this;
        var sender = await(this.getSenderName(senderId));
        var recipientName = sender.first_name + " " + sender.last_name;
        var orderNumber = "1234";
        var total = this.calculateTotalPrice(this.orderDetail);
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
        for (var i = 0; i < that.orderDetail.length; i++) {
            var element = {
                title : that.orderDetail[i].productName,
                subtitle: "Sản phẩm được làm từ abc xyz",
                quantity: this.orderDetail[i].quantity,
                price: that.orderDetail[i].price.trim() + ".00",
                currency: "VND",
                image_url: that.orderDetail[i].productUrl
            }
            elements.push(element)
        }
        // var elements = [{
        //     title : "hoho",
        //     subtitle: "Sản phẩm được làm từ abc xyz",
        //     quantity: 2,
        //     price: 50000.00,
        //     currency: "VND",
        //     image_url: "https://i.pinimg.com/564x/bc/0e/bf/bc0ebf96745c03b082a01fe6290c69ad.jpg"
        // }]
        console.log(elements)
        this.sendReceipt(senderId, recipientName, orderNumber, paymentMethod, orderUrl, address, summary, adjustments, elements)
    }
    

    // orderProduct(input, senderId) {
    //     var result = null;
    //     var s = "";
    //     var that = this;
    //     if (input != null) {
    //         var orderQuantity = input.match(/\d+/g)[0];
    //         this.sendTyping(senderId);

    //         var orderedProduct = input.substring(that.posToAnalyze, input.length);

    //         s = "Bạn muốn gọi thêm món gì không?";
    //         new Request().sendGetRequest('/LBFC/Store/GetProductInStoreByName', { 'storeId': '36', 'name': orderedProduct }, "")
    //             .then(function (data) {
    //                 console.log("data == " + data);
    //                 if (data.length == 0) {
    //                     s = "Quán không có bán món đó ạ";
    //                 } else {
    //                     result = data;
    //                     console.log(result);
    //                     that.orders.push(new Order(orderedProduct, orderQuantity));
    //                 }
    //                 that.reply(senderId, { 'text': s });

    //             });

    //     } else {
    //         s = "Bạn muốn gọi thêm món gì không?";
    //         this.reply(senderId, { 'text': s });
    //     }


    // }

    // finishOrder(senderId) {
    //     var s = "";
    //     s += "Để mình lặp lại order: \n";
    //     this.orders.forEach(function (order) {
    //         s += "Sản phẩm : " + order.productId + ", sl = " + order.quantity + "\n";
    //     }, this);
    //     this.reply(senderId, { 'text': s });

    // }

    // end(senderId) {
    //     this.orders = [];
    //     super.end(senderId);
    // }

    getName() {
        return "order dialog";
    }

}

module.exports = OrderDialog;