let Dialog = require('./dialog');
let ReceiveFullChangeOrderIntent = require('../intents/orders/receive-full-change-order-intent');
const Request = require('../utils/request')
const ConsoleLog = require('../utils/console-log')
const ProductModel = require('./entities/products/product');

class ChangeOrderDialog extends Dialog {

    constructor(session) {
        super(session);
        this.session.changeOrderDialog = {};
        this.push();
    }

    push() {
        this.addIntent(new ReceiveFullChangeOrderIntent(0, 1));
    }

    pause() {
        --this.step;
    }

    continue(input, senderId, info = null) {
        ConsoleLog.log(`Currently in step ${this.step}`, this.getName(), 68);        
        switch (this.step) {
            case 0: this.continueException(input, senderId, info); break;
            case 1:
                this.receiveChangeOrder(input, senderId, info);
                break;
            case 2:
                this.askForCurrentProduct(input, senderId, info);
                break;
            case 3:
                this.receiveCurrentProductName(input, senderId, info);
                break;
            case 4:
                this.askForNewProduct(input, senderId, info);
                break;
            case 5:
                this.receiveNewProduct(input, senderId, info);
                break;
            case 6:
                this.askForQuantity(input, senderId, info);
                break;
            case 7:
                this.receiveQuantity(input, senderId, info);
                break;
            // case 8:
            //     this.askExtraProduct(input, senderId, info);
            //     break;
            // case 9:
            //     this.receiveExtra(input, senderId, info);
            //     break;
            // case 10:
            //     this.receiveExtra(input, senderId, info);
            //     break;

            default:
                this.end();
                break;
        }
    }

    continueException(input, senderId, info = null) {
        switch(this.exception) {
            case 1: this.receiveFullChangeOrder(input, senderId, info); break;
        }
    }


    /**
     * Step 1: Hiện promotion của store ra
     * @param {int} senderId 
     */
    receiveChangeOrder(input, senderId, info) {
        this.step = 2;
        this.continue(input, senderId, info);
    }

    /**
     * Step 2
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} info 
     */
    askForCurrentProduct(input, senderId, info) {
        this.step = 3;
        this.sendTextMessage(senderId, `${this.session.pronoun} muốn đổi món gì?`);
    }

    /**
     * Step 3
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} info 
     */
    receiveCurrentProductName(input, senderId, info) {
        let order = this.session.orderDialog.orderDetails;

        order.some((o) => {
            if (o.productName == input) {
                this.session.changeOrderDialog.currentProduct = o;
                return true;
            }
        })

        if (this.session.changeOrderDialog.currentProduct == null) {
            this.sendTextMessage(senderId, `Em không tìm thấy món vừa rồi. Anh kiểm tra lại xem đúng tên món hông rồi nhập lại nha`);
            this.step = 3;
        } else {
            this.step = 4;
            this.continue(input, senderId, info);
        }
    }

    /**
     * Step 4
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} info 
     */
    askForNewProduct(input, senderId, info) {
        this.step = 5;
        this.sendTextMessage(senderId, `${this.session.pronoun} muốn đổi sang món gì?`);
    }

    /**
     * Step 5
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} info 
     */
    receiveNewProduct(input, senderId, info) {
        var that = this;
        new Request().sendGetRequest('/LBFC/Product/GetProductInBrand', { 'name': input, 'brandId': that.session.brandId }, "")
            .then(function (dataStr) {
                var data = JSON.parse(dataStr);
                if (data.length > 1) {
                    that.sendTextMessage(senderId, "Không tìm thấy món " + that.session.pronoun.toLowerCase() + " muốn tìm. Có phải ý " + that.session.pronoun.toLowerCase() + " là...");
                }
                var elements = [];
                for (var i = 0; i < data.length; i++) {
                    var element = {
                        title: data[i].ProductName,
                        image_url: data[i].PicURL,
                        subtitle: data[i].Price + "VND",
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
                                payload: "Đặt $" + data[i].ProductID +
                                    " $" + data[i].ProductName +
                                    " $" + data[i].Price +
                                    " $" + data[i].PicURL +
                                    " $" + data[i].ProductCode +
                                    " $" + that.session.brandId,
                            }
                        ]
                    }
                    elements.push(element);
                }
                that.sendGenericMessage(senderId, elements)
                    .then(function (data) {
                        that.sendQuickReply(senderId, "Nếu không thấy sản phẩm muốn đặt thì bấm nút \"Tìm nữa\" nha",
                            [{
                                content_type: "text",
                                title: "Tìm nữa",
                                payload: "search product simple",
                                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                            }]);
                    });

            })
    }

    /**
     * Step 6: Hỏi user số lượng muốn đặt
     * @param {int} senderId 
     */
    askForQuantity(senderId) {
        this.step = 5;
        this.sendTextMessage(senderId, this.session.pronoun + ' muốn mua bao nhiêu phần?');
    }


    /**
     * Nhận số lượng món hàng mà user muốn.
     * Current step = 7.
     * Cú pháp: \\d+
     * @param {string} input Số phần mà user nhập vào
     * @param {int} senderId id fb của user
     */
    receiveQuantity(input, senderId) {
        var currentProduct = this.session.orderDialog.currentProduct;
        var that = this;
        if (input.match(/^\d+$/g)) {
            currentProduct.quantity = parseInt(input);
            this.whenUserOrderTooMuch(currentProduct.quantity, senderId)
                .then((response) => {
                    this.step = 6;
                    this.insertProductToOrder(currentProduct.simplify());
                    ConsoleLog.log(currentProduct, this.getName(), 214);
                    this.sendTextMessage(senderId,
                        'Ok ' + input + ' phần ' + currentProduct.productName)
                        .then(function (data) {
                            that.continue(input, senderId);
                        });
                })
        } else {
            this.requireNumber(7, senderId);
        }
    }


    /*---------------------------------Exception----------------------------- */

    /**
     * Xử lý khi user áp dụng một promotion
     * @param {string} input 
     * @param {int} senderId 
     * @param {{productName, quantity}} info
     */
    receiveFullChangeOrder(input, senderId, info) {
        if (this.session.orderDialog.currentProduct.productCode == undefined) {
            this.step = 2;
            this.continue(input, senderId, info);
            return;
        }
        if (this.session.orderDialog[0] == undefined && this.session.orderDialog.currentProduct.productCode == undefined) {
            this.sendTextMessage(senderId, `${this.session.pronoun} ơi, anh chưa đặt món gì mà`);
            this.step = 999;
            this.continue('', '');
            return;
        }


        let that = this;
        new Request().sendGetRequest('/LBFC/Product/GetProductInBrand',
        { 'brandId': that.session.brandId, 'name': info.productName }, "")
        .then(function (data) {
            var result = JSON.parse(data);
            if (result.length == 1) {
                var product = new ProductModel(result[0]);
                product.quantity = parseInt(info.quantity);
                that.whenUserOrderTooMuch(product.quantity, senderId)
                    .then((response) => {
                        that.insertProductToOrder(product.simplify());
                        
                        that.sendTextMessage(senderId, `Vậy là mình đổi từ ${that.session.orderDialog.currentProduct.productName} sang ${info.quantity} phần ${info.productName} ha`)
                        .then(function (data) {
                        });
                        
                        that.session.orderDialog.currentProduct = product;
                    })
            } else {
                that.sendTextMessage(senderId, "Ko thấy tên món " + that.session.pronoun.toLowerCase() + " vừa nhập. Có phải ý " + that.session.pronoun.toLowerCase() + " là...");
                var elements = [];
                for (var i = 0; i < result.length; i++) {
                    var element = {
                        title: result[i].ProductName,
                        image_url: result[i].PicURL,
                        subtitle: result[i].Price + "VND",
                        default_action: {
                            "type": "web_url",
                            "url": "https://foody.vn",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall"
                        },
                        buttons: [
                            {
                                type: "postback",
                                title: "Cái này nè",
                                payload: "order change $" + result[i].ProductID + " $" + result[i].ProductName + " $" + result[i].Price + " $" + result[i].PicURL + " $" + result[i].ProductCode + " $" + that.session.brandId,
                            }
                        ]
                    }
                    elements.push(element);
                }
                ConsoleLog.log(elements, that.getName(), 440);

                that.sendGenericMessage(senderId, elements)
                    .then(function (data) {
                        that.sendQuickReply(senderId, "Nếu không thấy sản phẩm muốn đặt thì bấm nút \"Tìm nữa\" nha",
                            [{
                                content_type: "text",
                                title: "Tìm nữa",
                                payload: "search product simple",
                                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                            }]);
                    });
            }


        }).catch((err) => ConsoleLog.log(err, this.getName(), 420));
        that.step = 8;
        that.exception = 0;
        that.continue(input, senderId, info);
    }

    /**
     * Xử lý khi nhận postback từ nút đặt hàng 
     * @param {string} input Theo dạng "Đặt {tên sp} {id sp}"
     * @param {int} senderId 
     */
    receiveProductFromPostback(input, senderId, info) {
        this.session.orderDialog.currentProduct = new ProductModel({
            ProductID: info.productId,
            ProductName: info.productName,
            Price: info.price,
            PicURL: info.productUrl,
            DiscountPrice: info.price,
            ProductCode: info.productCode,
        });
        this.step = 4;
        this.continue(input, senderId);
    }

    /*------------------------Error----------------------*/
    /**
     * Báo lỗi yêu cầu nhập số và quay lại step n
     * @param {int} step Step để trở về sau khi báo lỗi
     * @param {int} senderId 
     */
    requireNumber(step, senderId) {
        var that = this;
        this.sendTextMessage(senderId, that.session.pronoun + ' vui lòng nhập số thôi').then(
            function (data) {
                that.step = step;
            }
        );
    }

    /*-------------------------Private method---------------------*/
    whenUserOrderTooMuch(quantity, senderId) {
        return new Promise((resolve, reject) => {
            if (quantity > 5) {
                this.sendImage(senderId, 'https://scontent.fsgn5-3.fna.fbcdn.net/v/t1.0-9/23316817_1532826110165685_6229607235109504163_n.jpg?oh=fcabbcb999876e9a2ea6a0b2a1efdb87&oe=5A6A329C')
                    .then((response) => {
                        this.sendTextMessage(senderId, "Gọi nhiều thía...");
                        resolve(response = "Done");
                    })
            } else {
                resolve("Done");
            }
        })
    }

    /**
     * 
     * @param {{productId, productName, price, discountPrice, quantity, productCode}} product 
     */
    insertProductToOrder(product) {
        var inserted = false;
        var that = this;
        this.session.orderDialog.orderDetails.some(function (orderDetail) {
            ConsoleLog.log(orderDetail, that.getName(), 671);
            if (orderDetail.productID == product.productID) {
                orderDetail.quantity += parseInt(product.quantity);
                inserted = true;
                return true;
            }
        }, this);
        if (!inserted) {
            this.session.orderDialog.orderDetails.push(product);
        }
    }

    getName() {
        return 'change order dialog';
    }
}

module.exports = ChangeOrderDialog