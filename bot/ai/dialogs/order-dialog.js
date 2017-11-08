var Order = require('./entities/order');
let Dialog = require('./dialog');
let Pattern = require('../intents/patterns/pattern');
let ClassParser = require('../utils/class-parser');
let Request = require('../utils/request');
let ConsoleLog = require('../utils/console-log');
var Await = require('asyncawait/await')
var Async = require('asyncawait/async');
let ProductModel = require('./entities/products/product');

/*-------------------Import intents-------------------*/
let ReceiveFullOrderIntent = require('../intents/orders/receive-full-order-intent');
let BeginOrderIntent = require('../intents/orders/begin-order-intent');
let PostbackOrderIntent = require('../intents/orders/postback-order-intent');
let ReceiveStoreNameIntent = require('../intents/orders/receive-store-name-intent')
let PostbackApplyPromotion = require('../intents/promotions/postback-apply-promotion-intent');
const PostbackChangePromotionIntent = require('../intents/promotions/postback-change-promotion-intent');
const CancelApplyPromotionIntent = require('../intents/promotions/cancel-apply-promotion-intent');
/*----------------------------------------------------*/

/*-------------------Template-------------------------*/
let SimpleTextTemplate = require('./templates/simple-text-template');
let ButtonTemplate = require('./templates/button-template');

class OrderDialog extends Dialog {

    constructor(session) {
        super(session);

        /**
         * @type {}
         */
        this.session.orderDialog = {};
        this.session.orderDialog.orderDetails = [];
        this.session.orderDialog.finalPrice = this.session.orderDialog.originalPrice = 0;

        /**
         * @type {{ProductModel}}
         */
        this.session.orderDialog.currentProduct = {};
        this.push();
    }

    push() {
        this.addIntent(new ReceiveFullOrderIntent(0, 1));
        this.addIntent(new BeginOrderIntent(2, 0));
        this.addIntent(new PostbackOrderIntent(0, 2));
        this.addIntent(new ReceiveStoreNameIntent(12, 0, this.session));
        this.addIntent(new PostbackApplyPromotion(9, 0));
        this.addIntent(new PostbackChangePromotionIntent(0, 3));
        this.addIntent(new CancelApplyPromotionIntent(0, 4));
    }

    continue(input, senderId, info = null) {
        ConsoleLog.log(`info = ${info}`, this.getName(), 52);
        switch (this.step) {
            case 0: this.continueException(input, senderId, info); break;
            case 1: this.receiveRequire(input, senderId); break;
            case 2: this.askForProduct(senderId); break;
            case 3: this.receiveProduct(input, senderId); break;
            case 4: this.askForQuantity(senderId); break;
            case 5: this.receiveQuantity(input, senderId); break;
            case 6: this.askForMore(senderId); break;
            case 7: this.receiveMoreProduct(input, senderId); break;
            case 8: this.recommendPromotions(senderId); break;
            case 9: this.receivePromotion(input, senderId, info); break;
            case 10: this.askOrderType(input, senderId); break;
            case 11: this.receiveOrderType(input, senderId); break;
            case 12: this.receiveStore(input, senderId, info); break;
            case 12.1: this.receiveConfirmStore(input, senderId); break;
            case 12.2: this.receiveEditStoreName(input, senderId); break;
            case 12.3: this.receiveLocation(input, senderId); break;
            case 12.4: this.receiveDeliveryAdrress(input, senderId); break;
            case 13: this.askForConfirmation(input, senderId); break;
            case 14: this.receiveConfirmation(input, senderId); break;
            case 15: this.end(); break;
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
            case 3:
                this.changePromotion(input, senderId, info); break;
            case 4:
                this.confirmCancelPromotion(senderId); break;
            default:
                break;
        }
    }

    end() {
        this.session.orderDialog = null;
        this.status = 'end';
    }

    receiveRequire(input, senderId) {
        this.step = 2;
        this.continue(input, senderId);
    }

    /**
     * Step 2
     * @param {*} senderId 
     */
    askForProduct(senderId) {
        this.step = 3;
        var buttons = [
            {
                'type': 'postback',
                'title': 'Xem menu',
                'payload': 'menu show',
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

        new Request().sendGetRequest('/LBFC/Product/GetProductInBrand', { 'name': input, 'brandId': that.session.brandId }, "")
            .then(function (dataStr) {
                var data = JSON.parse(dataStr);
                if (data.length > 1) {
                    that.sendTextMessage(senderId, "Không tìm thấy món bạn muốn tìm. Có phải ý bạn là...");
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
        var currentProduct = this.session.orderDialog.currentProduct;
        var that = this;
        if (input.match(/^\d+$/g)) {
            currentProduct.quantity = parseInt(input);
            this.whenUserOrderTooMuch(currentProduct.quantity, senderId);
            this.step = 6;
            this.insertProductToOrder(currentProduct.simplify());
            this.reply(senderId,
                new SimpleTextTemplate('Ok ' + input + ' phần ' + currentProduct.productName).template)
                .then(function (data) {
                    that.session.orderDialog.currentProduct = {};
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
        if (input.match(/(hết rồi|hết|không|không còn|ko)/i)) {

            this.step = 8;
            this.continue(input, senderId);
        } else {
            this.step = 2;
            this.continue(input, senderId);
        }
    }

    /**
     * Step 8
     * @param {*} senderId 
     */
    recommendPromotions(senderId) {
        var that = this;
        this.session.orderDialog.originalPrice = this.calculateTotalPrice(this.session.orderDialog.orderDetails);
        var data = {
            "order": {
                "OrderDetails": this.session.orderDialog.orderDetails,
                "originalPrice": this.session.orderDialog.originalPrice,
            }
        }
        this.sendTextMessage(senderId, "Bên mình có một số chương trình khuyến mãi nè.");
        new Request().sendPostRequest("/LBFC/Promotion/GetSuitablePromotions", data)
            .then(function (dataStr) {
                if (dataStr != undefined && dataStr.length > 0) {
                    var data = JSON.parse(dataStr);
                    var s = "Bạn có muốn xài mấy khuyến mãi dưới này ko?\n";
                    var elements = [];
                    data.forEach(function (element) {
                        var e = {
                            title: element.Name,
                            image_url: element.ImageURL,
                            subtitle: element.Description,
                            default_action: {
                                "type": "web_url",
                                "url": "https://www.facebook.com/permalink.php?story_fbid=143435499716864&id=119378645455883",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall"
                            },
                            buttons: [
                                {
                                    type: "postback",
                                    title: "Áp dụng",
                                    payload: "promotion select $" + element.Code,
                                }
                            ]
                        }
                        elements.push(e);
                    }, this);
                    that.sendGenericMessage(senderId, elements);
                    that.step = 9;
                }
            });
    }

    /**
     * Step 9
     * @param {*} input 
     * @param {*} senderId 
     * @param {{promotionCode: string}} info
     */
    receivePromotion(input, senderId, info) {
        var that = this;
        var applied = false;
        if (input.match(/^promotion select \$/i)) {
            if (this.session.orderDialog.currentPromotion != null) {
                this.remindPromotion(senderId, { promotionCode: info.promotionCode });
            } else {
                var promotionCode = info.promotionCode;
                new Request().sendGetRequest("/LBFC/Promotion/GetPromotionDetail", { 'promotionCode': promotionCode })
                    .then(function (dataStr) {
                        var data = JSON.parse(dataStr);
                        that.applyPromotion(data);
                        that.sendTextMessage(senderId, `Ok vậy mình chọn khuyến mãi ${promotionCode} ha.`);
                        that.step = 13;
                        that.continue(input, senderId);
                    });
            }
        } else {
            that.step = 8;
            that.continue(input, senderId);
        }
    }


    /**
     * Step 10: Hỏi giao hàng hay tới lấy
     * @param {string} input 
     * @param {number} senderId 
     */
    askOrderType(input, senderId) {
        console.log("đang ở ask order type");
        this.step = 11;
        this.sendQuickReply(senderId, "Vui lòng chọn phương thức nhận hàng?",
            [{
                content_type: "text",
                title: "Tại cửa hàng",
                payload: "Tại cửa hàng",
                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
            }, {
                content_type: "text",
                title: "Giao hàng",
                payload: "Delivery",
                image_url: "https://cdn1.iconfinder.com/data/icons/transportation-4/512/vespa-512.png"
            }]
        )
    };

    /**
     * Step 11: Nhận xem là user muốn tới lấy hay được giao
     * @param {string} input 
     * @param {number} senderId 
     */
    receiveOrderType(input, senderId) {
        var that = this;
        if (input.match(/tại cửa hàng/i)) {
            if (that.session.coordinates) {
                that.step = 12
                var data = await(new Request().sendGetRequest('/LBFC/Store/GetNearbyStoreOutdoor', { "lat": this.session.coordinates.lat, "lon": this.session.coordinates.long, "brandId": this.session.brandId }))
                var listStoreNearBy = JSON.parse(data)
                var top4NearByStore = []
                for (var i = 0; i < 4; i++) {
                    var element = {
                        title: listStoreNearBy[i].Name,
                        image_url: listStoreNearBy[i].LogoUrl,
                        subtitle: listStoreNearBy[i].Address,
                        default_action: {
                            "type": "web_url",
                            "url": "https://foody.vn",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall"
                        },
                        buttons: [
                            {
                                type: "postback",
                                title: "Chọn cửa hàng",
                                payload: "Chọn cửa hàng " + "$" + listStoreNearBy[i].ID + " $" + listStoreNearBy[i].Name
                            }
                        ]
                    }
                    top4NearByStore.push(element);
                }
                that.sendGenericMessage(senderId, top4NearByStore)
            } else {
                that.step = 12.3
                that.sendTextMessage(senderId, "Cửa hàng ở đâu thì thuận tiện cho bạn?")
            }
        } else if (input.match(/(delivery|giao hàng)/i)) {
            that.step = 12.4
            this.sendTextMessage(senderId, 'Bạn muốn giao hàng đến đâu?');
        }
    }

    /**
     * 
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveConfirmStore(input, senderId) {
        console.log("đã chạy vào hàm receiveConfirmStore")
        var that = this;
        if (input.match(/(ok|đúng rồi|đúng|chính nó|nó đó|chuẩn luôn|chính xác)/i)) {
            this.step = 11
            that.continue(input, senderId)
        }
    }

    receiveEditStoreName(input, senderId) {
        this.step = 10;
        this.continue(input, senderId)
    }

    /**
     * Step 12: Hỏi User chọn cửa hàng nào
     * + Nếu có cửa hàng => step 11
     * + Nếu sai chính tả trong giới hạn cho phép => step 10.1
     * + Nếu sai quá nhiều => không hiểu => step 10.2
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} info 
     */
    receiveStore(input, senderId, info) {
        var that = this
        //Nếu user click button "Chọn cửa hàng"
        if (info.storeId && info.storeName) {
            that.step = 13;
            var storeId = info.storeId;
            var storeName = info.storeName;
            this.continue(input, senderId);
        }
        //Nếu user nhập tay tên cửa hàng
        else if (info.listStoreMatching) {
            var listStoreMatching = info.listStoreMatching;
            var replyText = "";
            if (listStoreMatching.length == 1) {
                that.step = 12.1;
                that.sendTextMessage(senderId, "Có phải ý của bạn là cửa hàng " + listStoreMatching[0].storeName)

            } else if (listStoreMatching.length > 1) {
                for (var i = 0; i < listStoreMatching.length; i++) {
                    replyText += i + ". " + listStoreMatching[i].storeName + "\n"
                }
                that.sendTextMessage(senderId, "Ý của bạn là cửa hàng nào?")
                that.sendTextMessage(senderId, replyText)
                that.step = 12.2;
            } else if (listStoreMatching.length < 1) {
                that.sendTextMessage(senderId, "Xin lỗi cửa hàng này không có trong hệ thống! Vui lòng chọn cửa hàng khác ^.^")
            }
        }
    }

    /**
     * Step 13: confirm lại order
     * @param {number} senderId 
     */
    askForConfirmation(input, senderId) {
        this.step = 14
        var that = this;
        this.session.orderDialog.orderDetails.forEach(function (element) {
            ConsoleLog.log(element, that.getName(), 459);
        }, this);
        this.getSenderName(senderId)
            .then(function (sender) {
                var recipientName = sender.first_name + " " + sender.last_name;
                var orderNumber = "1234";
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
                    total_cost: that.session.orderDialog.finalPrice
                }
                var adjustments = [
                    {
                        name: "abc",
                        amount: 10
                    }
                ]
                var elements = [];
                for (var i = 0; i < that.session.orderDialog.orderDetails.length; i++) {
                    var element = {
                        title: that.session.orderDialog.orderDetails[i].productName,
                        subtitle: "Sản phẩm được làm từ abc xyz",
                        quantity: that.session.orderDialog.orderDetails[i].quantity,
                        price: that.session.orderDialog.orderDetails[i].price,
                        currency: "VND",
                        image_url: that.session.orderDialog.orderDetails[i].productUrl
                    }
                    elements.push(element)
                }
                that.sendReceipt(senderId, recipientName, orderNumber, orderUrl, address, summary, adjustments, elements)
                    .then(function (data) {
                        that.sendTextMessage(senderId, 'Đồng ý đặt hàng?');
                    });

            });

    }

    /**
     * Step 14: Nhận coi user có đồng ý đặt hàng không
     * @param {string} input 
     * @param {number} senderId 
     */
    receiveConfirmation(input, senderId) {
        if (input.match(/(ok|đồng ý|đúng rồi|có|yes)/i)) {
            this.order(senderId)
                .then((data) => {
                    this.sendTextMessage(senderId, "Yayyyyyyyyyyyyyyyyyyyyyyyy");
                    this.sendTextMessage(senderId, 'Đơn hàng của bạn đã thành công.')
                    this.sendTextMessage(senderId, 'Vui lòng đợi trong ít phút nhân viên cửa hàng sẽ gọi điện cho bạn')
                    this.sendTextMessage(senderId, 'Chúc bạn một ngày vui vẻ')
                })
                .catch((err) => {
                    console.log(err);
                })
            this.step = 15;
            this.continue(input, senderId);
        } else if (input.match(/(ko|không|hủy|thôi)/i)) {
            this.sendTextMessage('Đơn hàng của bạn đã bị hủy')
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
        if (this.session.orderDialog.finalPrice == undefined) this.session.orderDialog.finalPrice = 0;
        new Request().sendGetRequest('/LBFC/Product/GetProductInBrand',
            { 'brandId': that.session.brandId, 'name': info.productName }, "")
            .then(function (data) {
                var result = JSON.parse(data);
                if (result.length == 1) {
                    var product = new ProductModel(result[0]);
                    product.quantity = parseInt(info.quantity);
                    that.whenUserOrderTooMuch(product.quantity, senderId);
                    that.insertProductToOrder(product.simplify());
                    that.step = 6;
                    that.reply(senderId,
                        new SimpleTextTemplate('Ok ' + info.quantity + ' phần ' + info.productName).template)
                        .then(function (data) {
                            that.continue(input, senderId);
                        });
                    that.exception = 0;
                } else {
                    that.sendTextMessage(senderId, "Ko thấy tên món bạn vừa nhập. Có phải ý bạn là...");
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
                                    payload: "Đặt $" + result[i].ProductID + " $" + result[i].ProductName + " $" + result[i].Price + " $" + result[i].PicURL + " $" + that.session.brandId,
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


    /**
     * 
     * @param {*} input 
     * @param {*} sender 
     * @param {{promotionCode}} info 
     */
    changePromotion(input, senderId, info) {
        new Request().sendGetRequest("/LBFC/Promotion/GetPromotionDetail", { 'promotionCode': info.promotionCode })
            .then((dataStr) => {
                var data = JSON.parse(dataStr);
                this.applyPromotion(data);
                this.sendTextMessage(senderId, `Ok vậy mình chọn khuyến mãi ${info.promotionCode} ha.`);
                this.step = 13;
                this.continue(input, senderId);
            });
    }


    confirmCancelPromotion(senderId) {
        
        this.sendTextMessage(senderId, "Bạn à, sao bạn lại ko áp dụng khuyến mãi nữa?")
            .then((data) => {
                this.sendTextMessage(senderId, "Xài khuyến mãi đi, được giảm giá mà")
                    .then((data) => {
                        this.sendQuickReply(senderId, "Bạn có chắc là hông muốn áp dụng khuyến mãi chứ? :'<",
                            [{
                                content_type: "text",
                                title: "Hoy hông hủy nữa",
                                payload: "promotion keep",
                                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                            }, {
                                content_type: "text",
                                title: "Ừ, hủy",
                                payload: "promotion cancel",
                                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"

                            }]);
                    })
            })
    }

    cancelPromotion(senderId) {
        this.session.orderDialog.currentPromotion = {};
        this.session.orderDialog.orderDetails.forEach((element) => {
            element.discountPrice = element.price;
        }, this);
        this.session.orderDialog.finalPrice = this.session.orderDialog.originalPrice;
        this.sendTextMessage(senderId, "Đã hủy khuyến mãi :'<")
    }


    /*-------------------------End exception section-----------------------*/

    /*---------------------------Sub dialogs-----------------------------*/


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

    /**
     * Gọi khi user vô tình nhấn apply promotion mặc dù đã apply rồi
     * @param {*} step 
     * @param {*} senderId 
     * @param {{promotionCode}} info 
     */
    remindPromotion(senderId, info) {
        var currentPromotion = this.session.orderDialog.currentPromotion;
        if (currentPromotion.PromotionCode == info.promotionCode) {
            this.sendTextMessage(senderId, "Bạn đã áp dụng khuyến mãi này rồi đó. Nãy bạn mới bấm kìa");
        } else {
            this.sendQuickReply(senderId, `Nãy bạn áp dụng khuyến mãi ${currentPromotion.PromotionCode} rồi ấy. Bạn muốn đổi lại khuyến mãi ${info.promotionCode} hả?`,
                [{
                    content_type: "text",
                    title: "Ừ đổi đi",
                    payload: "promotion change \$" + info.promotionCode,
                    image_url: 'https://cdn4.iconfinder.com/data/icons/ballicons-2-free/100/like-128.png'
                }, {
                    content_type: "text",
                    title: "Hoy hông đổi đâu",
                    payload: "promotion keep \$" + currentPromotion.PromotionCode,
                    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/No_Cross.svg/120px-No_Cross.svg.png'
                }]);
        }
    }


    /*------------------------ End error handler section-----------------*/

    /*--------------------------Private method----------------------------*/

    /**
     * 
     * @param {[{productId, productName, price, discountPrice, quantity, productCode}]} listProduct 
     */
    calculateTotalPrice(listProduct) {
        var total = 0;
        for (var i = 0; i < listProduct.length; i++) {
            total += (parseInt(listProduct[i].discountPrice) * parseInt(listProduct[i].quantity));
        }
        return total;
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

    /**
     * 
     * @param {[{PromotionDetailID, PromotionCode, BuyProductCode, DiscountRate, DiscountAmount, MinOrderAmount, MaxOrderAmount}]} data 
     */
    applyPromotion(data) {
        var that = this;
        data.some(function (element) {
            ConsoleLog.log(element, that.getName(), 294);
            that.session.orderDialog.currentPromotion = element;
            if (element.BuyProductCode != null) {
                that.session.orderDialog.orderDetails.forEach(function (detail) {
                    if (detail.productCode == element.BuyProductCode) {
                        if (element.DiscountRate != null) {
                            detail.discountPrice = detail.price * (element.DiscountRate / 100);
                        } else {
                            detail.discountPrice = detail.price - element.DiscountAmount;
                        }
                        that.session.orderDialog.finalPrice = that.calculateTotalPrice(that.session.orderDialog.orderDetails);
                        return true;
                    } else {
                        detail.discountPrice = detail.price;
                    }
                }, this);
            } else if (that.session.orderDialog.originalPrice >= element.MinOrderAmount && that.session.orderDialog.originalPrice < element.MaxOrderAmount) {
                if (element.DiscountRate != null) {
                    that.session.orderDialog.finalPrice = that.session.orderDialog.originalPrice * ((100 - element.DiscountRate) / 100);
                } else {
                    that.session.orderDialog.finalPrice = that.session.orderDialog.originalPrice - element.DiscountAmount;
                }
                return true;
            }
        }, this);
    }

    order(senderId) {
        let params = {
            'facebookId': senderId,
            'model': {
                'OrderDetails': this.session.orderDialog.orderDetails,
                'originalPrice': this.session.orderDialog.originalPrice,
                'finalPrice': this.session.orderDialog.finalPrice,
                'AppliedPromotion': {
                    'DiscountAmount': this.session.orderDialog.currentPromotion.DiscountAmount,
                    'DiscountRate': this.session.orderDialog.currentPromotion.DiscountRate,
                    'PromotionDetailID': this.session.orderDialog.currentPromotion.PromotionDetailID,
                    'PromotionCode': this.session.orderDialog.currentPromotion.PromotionCode
                }
            }
        }

        return new Request().sendPostRequest("/LBFC/Order/Order", params);

    }


    whenUserOrderTooMuch(quantity, senderId) {
        if (quantity > 5) {
            this.sendImage(senderId, 'https://scontent.fsgn5-3.fna.fbcdn.net/v/t1.0-9/23316817_1532826110165685_6229607235109504163_n.jpg?oh=fcabbcb999876e9a2ea6a0b2a1efdb87&oe=5A6A329C')
            this.sendTextMessage(senderId, "Gọi nhiều thía...");
        }
    }

    getName() {
        return "order dialog";
    }

    reset() {
        super.reset();
        this.session.orderDialog = {};
        this.session.orderDialog.orderDetails = [];
        this.session.orderDialog.finalPrice = this.session.orderDialog.originalPrice = 0;

        /**
         * @type {{ProductModel}}
         */
        this.session.orderDialog.currentProduct = {};
    }


}

module.exports = OrderDialog;