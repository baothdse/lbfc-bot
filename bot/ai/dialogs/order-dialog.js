let Dialog = require('./dialog');
let Request = require('../utils/request');
let ConsoleLog = require('../utils/console-log');
var Await = require('asyncawait/await')
var Async = require('asyncawait/async');
let ProductModel = require('./entities/products/product');
const Enums = require('../enum');

/*-------------------Import intents-------------------*/
const BeginOrderIntent = require('../intents/orders/begin-order-intent');
const PostbackOrderIntent = require('../intents/orders/postback-order-intent');
const ReceiveStoreNameIntent = require('../intents/orders/receive-store-name-intent')
const PostbackApplyPromotion = require('../intents/promotions/postback-apply-promotion-intent');
const PostbackChangePromotionIntent = require('../intents/promotions/postback-change-promotion-intent');
const CancelApplyPromotionIntent = require('../intents/promotions/cancel-apply-promotion-intent');
const AddExtraIntent = require('../intents/orders/add-extra-intent');
const RequestFinishOrderIntent = require('../intents/orders/request-finish-order-intent');
const PostbackConfirmAddressIntent = require('../intents/delivery/postback-confirm-address');
const ReceiveProductNameIntent = require('../intents/orders/receive-product-name-intent')
const ConfirmExtraQuantityIntent = require('../intents/extra/confirm-extra-quantity-intent')

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
        if (this.session.orderDialog == undefined) {
            this.session.orderDialog = {};
            this.session.orderDialog.orderDetails = [];
            this.session.orderDialog.finalPrice = this.session.orderDialog.originalPrice = 0;
            /**
         * @type {{ProductModel}}
         */
            this.session.orderDialog.currentProduct = {};
        }

        
        this.push();
    }

    push() {
        // this.addIntent(new BeginOrderIntent(2, 0));
        // this.addIntent(new PostbackOrderIntent(0, 2));
        // this.addIntent(new ReceiveStoreNameIntent(20, 0, this.session));
        // this.addIntent(new PostbackApplyPromotion(14, 0));
        // this.addIntent(new PostbackChangePromotionIntent(0, 3));
        // this.addIntent(new CancelApplyPromotionIntent(0, 4));
        // this.addIntent(new AddExtraIntent(7, 0));
        // this.addIntent(new RequestFinishOrderIntent(13, 0));
        // this.addIntent(new PostbackConfirmAddressIntent(20.5, 0));
        // this.addIntent(new ReceiveProductNameIntent(0, 5));
        // this.addIntent(new ConfirmExtraQuantityIntent(10, 0));
    }

    continue(input, senderId, info = null) {
        ConsoleLog.log(`CURRENTLY IN STEP ${this.step}`, this.getName(), 68);

        switch (this.step) {
            case 0: this.continueException(input, senderId, info); break;
            case 1: this.receiveRequire(input, senderId); break;
            case 2: this.askForProduct(senderId); break;
            case 3: this.receiveProduct(input, senderId); break;
            case 4: this.askForQuantity(senderId); break;
            case 5: this.receiveQuantity(input, senderId); break;
            case 6: this.askExtraProduct(input, senderId); break;
            case 7: this.receiveExtra(input, senderId, info); break;
            case 8: this.receiveExtraQuantity(input, senderId); break;
            case 9: this.askExtraBelongToWhichProduct(input, senderId);
            case 10: this.receiveExtraBelongToWhichProduct(input, senderId, info); break;
            case 10.1: this.receiveExtraBelongToWhichProductAgain(input, senderId); break;
            case 11: this.askForMore(senderId); break;
            case 12: this.receiveMoreProduct(input, senderId); break;
            case 13: this.recommendPromotions(senderId); break;
            case 14: this.receivePromotion(input, senderId, info); break;
            case 15: this.askOrderType(input, senderId); break;
            case 16: this.receiveOrderType(input, senderId); break;
            case 17: this.askCurrentLocation(input, senderId); break;
            case 18: this.receiveCurrentLocation(input, senderId); break;
            case 19: this.askStore(input, senderId); break;
            case 20: this.receiveStore(input, senderId, info); break;
            case 20.1: this.receiveConfirmStore(input, senderId); break;
            case 20.2: this.receiveEditStoreName(input, senderId); break;
            case 20.3: this.receiveLocation(input, senderId); break;
            case 20.4: this.receiveDeliveryAdrress(input, senderId); break;
            case 20.5: this.receiveAdrressConfirmation(input, senderId, info); break;
            case 21: this.askPhoneNumber(input, senderId); break;
            case 22: this.receivePhoneNumber(input, senderId); break;
            case 23: this.checkForMembership(senderId); break;
            case 24: this.askForMembershipCard(input, senderId); break;
            case 25: this.receiveMembershipCardCode(input, senderId, info); break;
            case 26: this.checkForPaymentAbility(input, senderId, info); break;
            case 27: this.receiveUsingCardConfirmation(input, senderId, info); break;
            case 28: this.askForConfirmation(input, senderId); break;
            case 29: this.receiveConfirmation(input, senderId, info); break;
            case 29.1: this.receiveCancelConfirmation(input, senderId); break;
            case 30: this.end(); break;

            default: this.end(); break;
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
            case 5:
                this.receiveProductName(input, senderId, info); break;
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
        this.sendTextMessage(senderId, this.session.pronoun + ' muốn gọi món gì? ^.^')
        .catch((err) => ConsoleLog.log(err, this.getName(), 164));

    }


    /**
     * Nhận tên của sản phẩm user muốn order
     * @param {string} input tên của sản phẩm
     * @param {*} senderId 
     */
    receiveProduct(input, senderId) {
        var that = this;
        this.sendTyping(senderId);
        this.step = 4;
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
     * Step 4: Hỏi user số lượng muốn đặt
     * @param {int} senderId 
     */
    askForQuantity(senderId) {
        this.step = 5;

        this.sendTextMessage(senderId, this.session.pronoun + ' muốn mua bao nhiêu phần?');
    }


    /**
     * Nhận số lượng món hàng mà user muốn.
     * Current step = 5.
     * Cú pháp: \\d+
     * @param {string} input Số phần mà user nhập vào
     * @param {int} senderId id fb của user
     */
    receiveQuantity(input, senderId) {
        this.step = 6;

        var currentProduct = this.session.orderDialog.currentProduct;
        var that = this;
        if (input.match(/^\d+$/g)) {
            if (input <= 0) {
                this.requireGreaterThanZero(5, senderId);
            } else {
                currentProduct.quantity = parseInt(input);
                this.whenUserOrderTooMuch(currentProduct.quantity, senderId)
                    .then((response) => {
                        this.step = 6;
                        this.insertProductToOrder(currentProduct.simplify());
                        ConsoleLog.log(currentProduct, this.getName(), 214);
                        this.sendTextMessage(senderId, 'Ok ' + input + ' phần ' + currentProduct.productName)
                            .then(function (data) {
                                that.continue(input, senderId);
                            });
                    })

            }
        } else {
            this.requireNumber(5, senderId);
        }
    }

    /**
    * Step 6: Ask extra
    * @param {*} senderId
    * if(data != null) => receiveExtraProduct() else => askForMore() 
    */
    askExtraProduct(input, senderId) {
        let that = this;
        this.step = 7;
        let currentProduct = this.session.orderDialog.currentProduct;
        new Request().sendGetRequest('/LBFC/Product/GetProductExtra', { 'productId': currentProduct.productID }, "")
            .then((data) => {
                let listExtraProduct;
                if (data != "") {
                    that.step = 7;
                    that.sendTextMessage(senderId, 'Có một số món dùng kèm với món này, ' + this.session.pronoun.toLowerCase() + ' có muốn dùng không?')
                    listExtraProduct = JSON.parse(data);
                    let condition = listExtraProduct.length;
                    var top4Product = [];
                    for (var i = 0; i < condition; i++) {
                        var element = {
                            title: listExtraProduct[i].ProductName,
                            image_url: listExtraProduct[i].PicURL,
                            subtitle: listExtraProduct[i].Price + "VND",
                            default_action: {
                                "type": "web_url",
                                "url": "https://foody.vn",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall"
                            },
                            buttons: [
                                {
                                    type: "postback",
                                    title: "Thêm extra",
                                    payload: "Thêm extra $" + listExtraProduct[i].ProductID + " $" + listExtraProduct[i].ProductName + " $" + listExtraProduct[i].Price
                                }
                            ]
                        }
                        top4Product.push(element);
                    }
                    that.sendGenericMessage(senderId, top4Product)
                } else {
                    that.step = 9;
                    that.continue(input, senderId);
                }
            })
            .catch((err) => {
                ConsoleLog.log(err, this.getName(), 299);
            })
    }

    /**
     * Step 7 : receive extra info from user
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} info 
     */
    receiveExtra(input, senderId, info) {
        ConsoleLog.log(this.session.orderDialog.currentProduct, this.getName(), 322);
        if (this.session.orderDialog.currentProduct.productName) {
            if (input.match(/^(không|ko|nô|không muốn|không áp dụng|ko mua|không mua|kg)/i)) {
                this.step = 11;
                this.continue(input, senderId);
            } else {
                console.log(info)
                this.step = 8;
                let currentProduct = this.session.orderDialog.currentProduct
                currentProduct.extras = [];
                let extra = {
                    productId: info.productId,
                    productName: info.productName,
                    price: info.price
                }

                currentProduct.extras.push(extra);
                this.sendQuickReply(senderId, 'Thêm bao nhiêu phần ' + info.productName.toLowerCase() + ' vậy ' + this.session.pronoun.toLowerCase(),
                    [{
                        content_type: "text",
                        title: "1",
                        payload: "1",
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/7/73/STC_line_1_icon.png"
                    }, {
                        content_type: "text",
                        title: "2",
                        payload: "2",
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/4/48/STC_line_2_icon.png"
                    }, {
                        content_type: "text",
                        title: "3",
                        payload: "3",
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/c/cf/STC_line_3_icon.png"
                    }, {
                        content_type: "text",
                        title: "4",
                        payload: "4",
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/9/91/STC_line_4_icon.png"
                    }, {
                        content_type: "text",
                        title: "5",
                        payload: "5",
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/9/99/STC_line_5_icon.png"
                    }])
            }
        } else {
            this.sendQuickReply(senderId, `Bên em ko có bán lẻ mấy món extra nhen ${this.session.pronoun.toLowerCase()}. ${this.session.pronoun.toLowerCase()} vui lòng đặt món trước nha!`,
                [{
                    content_type: "text",
                    title: "Đặt hàng",
                    payload: "Đặt hàng",
                    image_url: "https://thuongmaiviettrung.vn/uploads/the-shopping-cart-icon-5521.jpg"
                }])
            this.step = 30;
            this.continue(input, senderId);
        }


    }


    /**
     * Step 8: receive extra quantity
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveExtraQuantity(input, senderId) {
        let currentProduct = this.session.orderDialog.currentProduct;
        let that = this;
        let currentExtra = currentProduct.extras[currentProduct.extras.length - 1];
        if (input.match(/\d+/g)) {
            if (input <= 0) {
                this.requireGreaterThanZero(8, senderId);
            } 
            else {
                this.step = 9;
                currentExtra.quantity = input;
                this.sendTextMessage(senderId, 'Vâng, thêm ' + input + ' phần ' + currentExtra.productName)
                    .then((response) => {
                        this.continue(input, senderId)
                    })

            }
        } else {
            this.requireNumber(8, senderId);
        }
    }

    /**
     * Step 9:
     * Hỏi user extra này add cho sản phẩm nào.
     * Nếu currentProduct.quantity = 1 => step askForMore()
     * Nếu currentProduct.quantity > 1 => receiveExtraBelongToWhichProduct();
     * @param {*} input 
     * @param {*} senderId 
     */
    askExtraBelongToWhichProduct(input, senderId) {
        let currentProduct = this.session.orderDialog.currentProduct;
        let currentExtra = currentProduct.extras[currentProduct.extras.length - 1];
        if (currentProduct.quantity == 1) {
            this.step = 11
        } else if (currentProduct.quantity > 1) {
            this.step = 10;
            this.sendTextMessage(senderId, `${currentProduct.quantity} phần ${currentProduct.productName} đều thêm ${currentExtra.quantity} phần ${currentExtra.productName} hay sao ${this.session.pronoun.toLowerCase()}?`);
            currentProduct.note = `(Mỗi phần ${currentProduct.quantity} đều thêm ${currentExtra.quantity} phần ${currentExtra.productName})`;
        }
    }

    /**
     * Step 10:
     * Nhận câu trả lời extra add thêm vào sản phẩm nào => askForMore()
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveExtraBelongToWhichProduct(input, senderId, info) {
        let currentProduct = this.session.orderDialog.currentProduct;
        let currentExtra = currentProduct.extras[currentProduct.extras.length - 1];
        console.log('INFO =')
        console.log(info)
        if (info == null) {
            if (input.match(/(ko|ko phải|k|không|kg|thôi|sai rồi|sai|nô|no)/i)) {
                this.step = 10.1
                this.sendQuickReply(senderId, `Vậy ${this.session.pronoun.toLowerCase()} vui lòng nói rõ ra giúp em với`,
                    [{
                        content_type: "text",
                        title: `Mỗi ly ${currentExtra.quantity} phần`,
                        payload: `Mỗi ly ${currentExtra.quantity} phần`,
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/7/73/STC_line_1_icon.png"
                    },
                    {
                        content_type: "text",
                        title: `Mỗi ly 1 phần`,
                        payload: `Mỗi ly 1 phần`,
                        image_url: "https://upload.wikimedia.org/wikipedia/commons/7/73/STC_line_1_icon.png"
                    }])
            } else if (input.match(/(đúng rồi|phải|nó đó|ok|đúng|chính xác|ờ|ừ|ừm|ừn|uhm|uh|oh|ohm|ừa|yes)/i)) {
                this.step = 11
                currentExtra.quantity *= currentProduct.quantity;
                console.log("CURENT EXTRA quantity : " + currentExtra.quantity)
                this.continue(input, senderId);
            }
        } else {
            if (info.confirmExtraQuantity) {
                currentExtra.quantity = parseInt(info.confirmExtraQuantity * currentProduct.quantity);
                currentProduct.note = `${currentProduct.quantity} phần ${currentProduct.productName} thêm ${currentExtra.quantity} phần ${currentExtra.productName}`
                this.step = 11;
                this.continue(input, senderId);
            } else if (info.confirmExtraQuantityByWord) {
                let confirmExtraQuantity = this.convertWordToNumber(info.confirmExtraQuantityByWord);
                currentExtra.quantity = parseInt(confirmExtraQuantity * currentProduct.quantity);
                currentProduct.note =`${currentProduct.quantity} phần ${currentProduct.productName} thêm ${currentExtra.quantity} phần ${currentExtra.productName}`
                this.step = 11;
                this.continue(input, senderId);
            } else if (info.confirmProductHaveExtra) {
                if(typeof info.confirmProductHaveExtra == 'number') {
                    console.log("TYPE OF CONFIRM PRODUCT EXTRA IS NUMBER")
                    currentExtra.quantity = parseInt(info.confirmProductHaveExtra * currentExtra.quantity)
                    currentProduct.note =`${info.confirmProductHaveExtra} phần ${currentProduct.productName} thêm ${currentExtra.quantity} phần ${currentExtra.productName}`;
                    this.step = 11;
                    this.continue(input, senderId);
                } else {
                    console.log("TYPE OF CONFIRM PRODUCT EXTRA IS WORD")
                    let productHaveExtraQuantity = this.convertWordToNumber(info.confirmProductHaveExtra);
                    currentExtra.quantity = parseInt(productHaveExtraQuantity * currentExtra.quantity);
                    currentProduct.note = `${productHaveExtraQuantity} phần ${currentProduct.productName} thêm ${currentExtra.quantity} phần ${currentExtra.productName}`
                    this.step = 11;
                    this.continue(input, senderId)
                }
            }
        }
    }
    /**
     * Step 10.1:
     * Nhận câu trả lời extra add thêm vào sản phẩm nào => askForMore()
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveExtraBelongToWhichProductAgain(input, senderId) {
        this.step = 11;
        let currentProduct = this.session.orderDialog.currentProduct;
        currentProduct.note = input;
        this.continue(input, senderId);
    }


    /**
    * Step 11: Hỏi coi user có muốn đặt nữa hơm
    * @param {number} senderId 
    */
    askForMore(senderId) {
        this.step = 12;
        this.sendTextMessage(senderId, `${this.session.pronoun} muốn gọi thêm món gì không?`);
    }


    /**
      * Step 12: Nhận xem là user muốn đặt tiếp hay kết thúc
      * @param {string} input 
      * @param {int} senderId 
      */
    receiveMoreProduct(input, senderId) {
        if (input.match(/(hết rồi|hết|không|không còn|ko|kg)/i)) {
            this.step = 13;
            this.continue(input, senderId);
        } else {
            this.sendEmoji(senderId);
            this.step = 2;
            this.continue(input, senderId);
        }
    }

    /**

     * Step 13
     * @param {*} senderId 
     */
    recommendPromotions(senderId) {
        var that = this;

        this.step = 14;

        
        this.session.orderDialog.originalPrice = this.calculateTotalPrice(this.session.orderDialog.orderDetails);
        if (this.session.orderDialog.originalPrice == 0) {
            this.sendTextMessage(senderId, `${this.session.pronoun} đã đặt gì đâu???`)
            .then((res) => this.sendImage(senderId, Enums.USAGI_URL()));
            this.step = 40;
            this.continue('', '');
            return;
        }
        var data = {
            "order": {
                "OrderDetails": this.session.orderDialog.orderDetails,
                "originalPrice": this.session.orderDialog.originalPrice,
            },
            "brandId": this.session.brandId
        }
        new Request().sendPostRequest("/LBFC/Promotion/GetSuitablePromotions", data)
            .then((dataStr) => {
                var listPromotion = JSON.parse(dataStr);
                let condition = (listPromotion.length > 9) ? 9 : listPromotion.length;
                if (condition > 0) {
                    that.sendTextMessage(senderId, `Bên em có một số chương trình khuyến mãi nè. ${this.session.pronoun} có muốn áp dụng ko?`);
                    var elements = [];
                    for (let i = 0; i < condition; i++) {
                        let element = {
                            title: listPromotion[i].Name,
                            image_url: listPromotion[i].ImageURL,
                            subtitle: listPromotion[i].Description,
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
                                    payload: "promotion select $" + listPromotion[i].Code,
                                }
                            ]
                        }
                        elements.push(element);
                    }
                    that.sendGenericMessage(senderId, elements);
                    that.step = 14;
                } else {
                    that.step = 15;
                    that.continue('', senderId);
                }
            });
    }

    /**
     * Step 14
     * @param {*} input 
     * @param {*} senderId 
     * @param {{promotionCode: string}} info
     */
    receivePromotion(input, senderId, info) {
        var that = this;
        var applied = false;
        this.step = 15;
        ConsoleLog.log(info, this.getName(), 598);
        if (input.match(/^promotion select \$/i)) {
            if (this.session.orderDialog.orderDetails == 0) {
                this.sendTextMessage(senderId, "" + that.session.pronoun + " ơi, đặt hàng trước đã " + that.session.pronoun.toLowerCase() + " ơi")
                    .then((response) => {
                        this.step = 1;
                        this.continue(input, senderId);
                    })
            }
            else if (this.session.orderDialog.currentPromotion != null) {
                this.remindPromotion(senderId, { promotionCode: info.promotionCode });
            } else if (this.session.orderDialog.orderDetails.length > 0) {
                var promotionCode = info.promotionCode;
                new Request().sendGetRequest("/LBFC/Promotion/GetPromotionDetail", { 'promotionCode': promotionCode })
                    .then(function (dataStr) {
                        var data = JSON.parse(dataStr);
                        that.applyPromotion(data);
                        if (that.session.orderDialog.finalPrice == that.session.orderDialog.originalPrice) {
                            that.sendTextMessage(senderId, "Khuyến mãi này hông áp dụng được " + that.session.pronoun.toLowerCase() + " ơi. " + that.session.pronoun + " coi mấy khuyến mãi khác giùm em nha.")
                                .then((response) => {
                                    that.step = 13;
                                    that.continue(input, senderId);
                                })
                        } else {
                            that.sendTextMessage(senderId, `Ok vậy em chọn khuyến mãi ${promotionCode} ha.`)
                                .then((response) => {
                                    that.step = 15;
                                    that.continue(input, senderId);
                                })
                        }
                    });
            }
        } else if (input.match(/(bỏ qua|không|ko|kg|khong)/i)) {
            this.step = 15;
            this.continue(input, senderId);
        } else {
            that.step = 11;
            that.continue(input, senderId);
        }
    }


    /**
     * Step 15: Hỏi giao hàng hay tới lấy
     * @param {string} input 
     * @param {number} senderId 
     */
    askOrderType(input, senderId) {
        console.log("đang ở ask order type");
        this.step = 16;
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
     * Step 16: nhận xem user muốn giao hay tới lấy
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveOrderType(input, senderId) {
        if (input.match(/tại cửa hàng/i)) {
            this.step = 17;
            this.continue(input, senderId);
        } else if (input.match(/(delivery|giao hàng)/i)) {
            this.step = 20.4;
            this.sendTextMessage(senderId, `${this.session.pronoun} muốn giao hàng đến địa chỉ nào?`)
        }
    }


    /**
     * Step 17
     * @param {*} input 
     * @param {*} senderId 
     */
    askCurrentLocation(input, senderId) {
        this.sendTextMessage(senderId, `Để em kiếm cửa hàng gần nhất cho ${this.session.pronoun.toLowerCase()} cho.`)
        .then((res) => {
            this.sendLocation(senderId);
        })
        this.step = 18;
    }


    /**
     * Step 18: Nhận current location của user
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveCurrentLocation(input, senderId) {
        if (input.constructor === Array) {
            this.session.coordinates = input[0].payload.coordinates;
            this.step = 19;
            this.continue(input, senderId);
        } else {
            this.sendQuickReply(senderId, "Cửa hàng ở đâu thì thuận tiện cho " + this.session.pronoun.toLowerCase() + "?",
                [{
                    content_type: "text",
                    title: "Hệ thống cửa hàng",
                    payload: "Hệ thống cửa hàng",
                    image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                }]
            )
            this.step = 20

        }
    }
    /**
     * Step 19: Nhận xem là user muốn tới lấy hay được giao
     * @param {string} input 
     * @param {number} senderId 
     */
    askStore(input, senderId) {
        if (this.session.coordinates) {
            this.step = 20;
            this.sendTextMessage(senderId, `Mấy cửa hàng gần đây nè ${this.session.pronoun.toLowerCase()}.`);
            new Request().sendGetRequest('/LBFC/Store/GetNearbyStoreOutdoor', { "lat": this.session.coordinates.lat, "lon": this.session.coordinates.long, "brandId": this.session.brandId })
                .then((data) => {
                    let listStoreNearBy = JSON.parse(data)
                    let top4NearByStore = []
                    for (let i = 0; i < 4; i++) {
                        let element = {
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
                    this.sendGenericMessage(senderId, top4NearByStore)
                })
        } else {
            this.step = 20;
            this.sendTextMessage(senderId, `Mấy cửa hàng gần đây nè ${this.session.pronoun.toLowerCase()}.`);
            new Request().sendGetRequest('/LBFC/Store/GetAllStoresByBrand', { 'brandId': 1 }, "")
                .then((data) => {
                    let listStoreByBrand = JSON.parse(data);
                    let that = this;
                    let listStoreMatching = []
                    let replyText = "";
                    for (var i = 0; i < listStoreByBrand.length; i++) {
                        if (this.levenshteinDistance(input, listStoreByBrand[i].Name) <= 10) {
                            let store = {
                                storeId: listStoreByBrand[i].Id,
                                storeName: listStoreByBrand[i].Name,
                                ed: this.levenshteinDistance(input, listStoreByBrand[i].Name)
                            }
                            listStoreMatching.push(store)
                        }
                    }
                    this.bubbleSort(listStoreMatching);
                    if (listStoreMatching.length == 1) { // Nếu có 1 cửa hàng match
                        if (listStoreMatching[0].ed == 0) {
                            this.step = 21;
                            this.session.orderDialog.address = listStoreMatching[0].storeName
                            this.continue(input, senderId);
                        } else {
                            this.step = 20.1;
                            this.sendTextMessage(senderId, "Có phải ý của " + this.session.pronoun + " là cửa hàng " + listStoreMatching[0].storeName)
                        }
                    } else if (listStoreMatching.length > 1) {
                        for (var i = 0; i < listStoreMatching.length; i++) {
                            replyText += (i + 1) + ". " + listStoreMatching[i].storeName + "\n"
                        }
                        this.sendTextMessage(senderId, "Ý của " + this.session.pronoun.toLowerCase() + " là cửa hàng nào?")
                        this.sendTextMessage(senderId, replyText)
                        this.step = 19;
                    } else if (listStoreMatching.length < 1) {
                        this.sendTextMessage(senderId, "Xin lỗi cửa hàng này không có trong hệ thống! Vui lòng chọn cửa hàng khác ^.^")
                    }
                })
                .catch((err) => {
                    this.sendTextMessage(senderId, "Em chưa hiểu ý " + this.session.pronoun.toLowerCase() + " lắm, hì hì");
                    ConsoleLog.log(err, this.getName(), 474);
                })
        }
    }


    /**
     * Step 20: Hỏi User chọn cửa hàng nào
     * + Nếu có cửa hàng => step 14
     * + Nếu sai chính tả trong giới hạn cho phép => step 10.1
     * + Nếu sai quá nhiều => không hiểu => step 10.2
     * @param {*} input 
     * @param {*} senderId 
     * @param {{address}} info 
     */
    receiveStore(input, senderId, info) {
        if (info.storeId && info.storeName) {
            this.step = 21;
            this.session.orderDialog.address = info.storeName;
            this.continue(input, senderId);
        } else {
            let that = this;
            var replyText = "";
            var listAllStore = null;
            var listStoreMatching = [];
            var store = null;
            var promise = this.getAllStore()
                .then((data) => {
                    listAllStore = JSON.parse(data)
                    let condition = listAllStore.length;
                    for (var i = 0; i < condition; i++) {
                        if (that.levenshteinDistance(input, listAllStore[i].Name) <= 10) {
                            store = {
                                storeId: listAllStore[i].ID,
                                storeName: listAllStore[i].Name,
                                ed: that.levenshteinDistance(input, listAllStore[i].Name)
                            }
                            listStoreMatching.push(store);
                        }
                    }
                    that.bubbleSort(listStoreMatching);
                    if (listStoreMatching.length == 1) {
                        that.step = 21;
                        this.session.orderDialog.address = listStoreMatching[0].storeName;
                        this.sendTextMessage(senderId, this.session.pronoun + " kiểm tra lại đơn hàng nhé")
                        this.continue(input, senderId);
                        //Nếu user nhập tay tên cửa hàng
                    } else {
                        if (listStoreMatching[0].ed == 0) {
                            this.step = 21;
                            this.session.orderDialog.address = listStoreMatching[0].storeName;
                            this.continue(input, senderId);
                        } else {
                            condition = listStoreMatching.length
                            for (var i = 0; i < condition; i++) {
                                replyText += (i + 1) + ". " + listStoreMatching[i].storeName + "\n"
                            }
                            that.sendTextMessage(senderId, "Ý của " + that.session.pronoun.toLowerCase() + " là cửa hàng nào?")
                            that.sendTextMessage(senderId, replyText)
                            that.step = 20.2;
                        }
                    }
                })
        }
    }

    /**
     * Step 20.1 : 
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveConfirmStore(input, senderId) {
        if (input.match(/(ừ|ừm|ờ|ok|đúng rồi|đúng|chính nó|nó đó|chuẩn luôn|chính xác|uhm|ừn)/i)) {
            this.step = 21;
            this.session.orderDialog.address = input;
            this.sendEmoji(senderId)
            this.continue(input, senderId)
        } else if (input.match(/(ko|không|sai rồi|nhầm|lộn)/i)) {
            this.sendTextMessage(senderId, "Nếu ko phải " + this.session.orderDialog.address + " thì là cửa hàng nào?")
        }
    }


    /**
     * Step 20.2: Nhận được tên cửa hàng đã được sửa lại
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveEditStoreName(input, senderId) {
        this.step = 19;
        this.continue(input, senderId)
    }

    /**step 20.4 */
    receiveDeliveryAdrress(input, senderId) {
        if (!input.match(/\d+/i)) {
            this.sendTextMessage(senderId, `Nhập cả số nhà nha ${this.session.pronoun.toLowerCase()}`);
            this.step = 20.4;
            return;
        }
        this.step = 20.5;
        ConsoleLog.log(input, this.getName(), 761);
        const GOOGLE_API_KEY = 'AIzaSyD6D1KPx1dD32u0BHDHK2Pp0bDMnfkXLLM';
        const URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
        const params = {
            input,
            types: 'geocode',
            key: GOOGLE_API_KEY
        }
        new Request().sendUniversalGetRequest(URL, params, '')
        .then((response) => {
            let places = JSON.parse(response);
            let topPlace = places.predictions[0].description;
            let elements = [
                {
                    content_type: "text",
                    title: "Đúng rồi",
                    payload: `address use ${topPlace}`,
                    image_url: Enums.LIKE_ICON_URL(),
                 },
                 {
                     content_type: "text",
                     title: "Hông phải",
                     payload: `address refuse`,
                     image_url: Enums.DISLIKE_ICON_URL()
                 }
             ];
             this.sendQuickReply(senderId, `Có phải ý ${this.session.pronoun} là ${topPlace}?`, elements);
         })
         .catch((err) => {
             ConsoleLog.log(err, this.getName(), 789);
         })
    }

    /**
     * Step 20.5
     * @param {*} input 
     * @param {*} senderId 
     * @param {{address}} info 
     */
    receiveAdrressConfirmation(input, senderId, info) {
        if (info.address == null) {
            this.sendTextMessage(senderId, `${this.session.pronoun} có thể nhập lại địa chỉ mà rõ hơn xíu được hông?`)
                .then((response) => {
                    this.step = 20.4;
                })
        } else {
            this.session.orderDialog.address = info.address;
            this.step = 21;
            this.continue(input, senderId);
        }
    }

    /**
     * Step 21
     * @param {*} input 
     * @param {*} senderId 
     */
    askPhoneNumber(input, senderId) {
        this.sendTextMessage(senderId, this.session.pronoun + ' cho em xin số điện thoại với ☎☎☎');
        this.step = 22;
    }

    /**
     * Step 22
     * @param {*} input 
     * @param {*} senderId 
     */
    receivePhoneNumber(input, senderId) {
        if (!input.match(/\d{10,11}/i)) {
            this.sendTextMessage(senderId, `Nhập số điện thoại di động nha ${this.session.pronoun.toLowerCase()}`);
            this.step = 22;
        } else {
            this.session.orderDialog.phoneNumber = input;
            this.step = 23;
            this.continue(input, senderId);
        }
    }

    /**
     * Step 23
     * @param {*} senderId 
     */
    checkForMembership(senderId) {
        let params = {
            facebookPSID: senderId,
        }
        this.step = 24;
        new Request().sendGetRequest('/LBFC/Membership/SearchMembershipCardByFacebookPSID', params, '')
            .then((response) => {
                ConsoleLog.log(response, this.getName(), 970);
                if (response != '\"Membership card not found\"') {

                    /**
                     * @type {{Money, MembershipCardCode, Id, CustomerId}}
                     */
                    let card = JSON.parse(response);
                    if (card.Money >= this.session.orderDialog.finalPrice) {
                        let elements = [
                            {
                                content_type: "text",
                                title: "Xài",
                                payload: `membership card use ${card.MembershipCardCode}`,
                                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                            },
                            {
                                content_type: "text",
                                title: "Hông xài đâu",
                                payload: "membership card refuse",
                                image_url: "https://cdn4.iconfinder.com/data/icons/wirecons-free-vector-icons/32/menu-alt-512.png"
                            }
                        ]
                        this.sendQuickReply(senderId,
                            `Em thấy ${this.session.pronoun} có tạo thẻ thành viên này,  ${this.session.pronoun} có muốn xài không?`,
                            elements);
                    } else {
                        this.step = 24;
                        this.continue('', senderId);
                    }
                } else {
                    ConsoleLog.log("Card not founddddddddd", this.getName(), 811);

                    let elements = [
                        {
                            content_type: "text",
                            title: "Có rùi",
                            payload: `membership card available`,
                            image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                        },
                        {
                            content_type: "text",
                            title: "Không có",
                            payload: `membership card unavailable`,
                            image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                        }
                    ];
                    this.sendQuickReply(senderId, `${this.session.pronoun} có thẻ thành viên chưa?`, elements);
                }
            })
    }

    /**
     * Step 24
     * @param {*} input 
     * @param {*} senderId 
     */
    askForMembershipCard(input, senderId) {
        this.sendTextMessage(senderId, `${this.session.pronoun} nhập mã thẻ với`);
        this.step = 25;
    }
    /**
     * Step 25
     * @param {*} input 
     * @param {*} senderId 
     * @param {{cardCode}} info 
     */
    receiveMembershipCardCode(input, senderId, info) {
        let params = {
            membershipCardCode: info == undefined ? input : info.cardCode,
        }
        this.step = 26;
        ConsoleLog.log(params, this.getName(), 851);
        new Request().sendGetRequest('/LBFC/Membership/SearchMembershipCard', params, '')
            .then((response) => {
                if (response == "") {
                    this.sendTextMessage(senderId, 'Em không kiếm thấy mã thẻ vừa nhập :\'<');
                    this.step = 24;
                    this.continue('', senderId);
                } else {
                    this.insertMembershipCard(params.membershipCardCode, senderId)
                        .then((response) => {
                            if (response !== '502') {
                                this.sendTextMessage(senderId, 'Em đã liên kết mã thẻ với facebook.');
                                let info = JSON.parse(response);
                                this.step = 26;
                                this.continue(input, senderId, info);
                            } else {
                                this.sendTextMessage(senderId, `Hì hì hệ thống đang trục trặc xíu, ${this.session.pronoun} đợi xíu lát nhập lại nha.`);
                            }
                        })
                }
            })
    }

    /**
     * Step 26
     * @param {*} input 
     * @param {*} senderId 
     * @param {{Money, MembershipCardCode, Id, CustomerId}} info 
     */
    checkForPaymentAbility(input, senderId, info) {
        if (info.Money < this.session.orderDialog.finalPrice) {
            this.step = 27;
            this.sendTextMessage(senderId, `${this.session.pronoun} ơi, thẻ của ${this.session.pronoun} không đủ tiền rồi :\'< Em tính bằng tiền mặt đỡ nha.`)
                .then((res) => {
                    let response = {
                        isUsed: false,
                        cardCode: info.MembershipCardCode
                    }
                    this.continue(input, senderId, response);
                })
        } else {
            let response = {
                isUsed: true,
                cardCode: info.MembershipCardCode
            }
            this.step = 27;
            this.continue(input, senderId, response);
        }
    }

    /**
     * Step 27
     * @param {*} input 
     * @param {*} senderId 
     * @param {{isUsed:boolean, cardCode: string}} info 
     */
    receiveUsingCardConfirmation(input, senderId, info) {
        if (info.isUsed) {
            this.session.orderDialog.membershipCardCode = info.cardCode;
            this.sendTextMessage(senderId, 'Vậy là mình xài thẻ ha');
        } else {
            this.session.orderDialog.membershipCardCode = null;
            this.sendTextMessage(senderId, 'Vậy là mình không xài thẻ ha')
        }
        this.step = 28;
        this.continue(input, senderId);
    }

    /**
     * Step 28: confirm lại order
     * @param {number} senderId 
     */
    askForConfirmation(input, senderId) {
        this.step = 29;
        var that = this;
        this.session.orderDialog.finalPrice = this.session.orderDialog.finalPrice == 0 ? this.session.orderDialog.originalPrice : this.session.orderDialog.finalPrice;
        this.sendTextMessage(senderId, `${this.session.pronoun} kiểm tra lại đơn hàng giúp em nhé`);
        this.getSenderName(senderId)
            .then((sender) => {
                var recipientName = sender.first_name + " " + sender.last_name + ". \n Phone: " + this.session.orderDialog.phoneNumber;
                var orderNumber = "1234";
                var orderUrl = "https://tiki.vn/sales/order/view?code=75179106"
                var address = {
                    street_1: this.session.orderDialog.address,
                    street_2: "",
                    city: "TP.HCM",
                    postal_code: "760000",
                    state: "TP.HCM",
                    country: "VN"
                }
                var summary = {
                    subtotal: this.session.orderDialog.originalPrice,
                    shipping_cost: 0.00,
                    total_tax: Math.ceil(that.session.orderDialog.finalPrice * 10 / 11 * 0.1),
                    total_cost: that.session.orderDialog.finalPrice
                }
                var adjustments = [];
                if (this.session.orderDialog.currentPromotion != undefined && this.session.orderDialog.currentPromotion.PromotionCode != undefined) {
                    adjustments = [
                        {
                            name: `Giảm giá ${this.session.orderDialog.currentPromotion.PromotionCode}`,
                            amount: this.session.orderDialog.originalPrice - this.session.orderDialog.finalPrice,
                        }
                    ]
                }
                var elements = [];
                for (var i = 0; i < that.session.orderDialog.orderDetails.length; i++) {
                    var element = {
                        title: that.session.orderDialog.orderDetails[i].productName,
                        // subtitle: that.session.orderDialog.orderDetails[i].,
                        quantity: parseInt(that.session.orderDialog.orderDetails[i].quantity),
                        price: that.session.orderDialog.orderDetails[i].price,
                        currency: "VND",
                        image_url: that.session.orderDialog.orderDetails[i].productUrl
                    }
                    ConsoleLog.log(element, this.getName(), 655);
                    elements.push(element)
                }
                let paymentMethod = this.session.orderDialog.membershipCardCode == null ? "Tiền mặt" : "Thẻ thành viên";
                ConsoleLog.log(summary, this.getName(), 656);
                that.sendReceipt(senderId, recipientName, orderNumber, orderUrl, address, summary, adjustments, elements, paymentMethod)
                    .then((data) => {
                        that.step = 29;
                        that.session.orderDialog.cancelLoop = 1;

                    });

            });

    }


    /**
     * Step 29: Nhận coi user có đồng ý đặt hàng không
     * @param {string} input 
     * @param {number} senderId 
     * @param {} info
     */
    receiveConfirmation(input, senderId, info) {
        ConsoleLog.log(info, this.getName(), 1044);
        if (input.match(/(ok|đồng ý|đúng rồi|có|yes|đúng|ừ|tốt|gút|good|đặt hàng|okie|okay|oke)/i)) {
            this.order(senderId)
                .then((data) => {
                    this.sendTextMessage(senderId, 'Đơn hàng của ' + this.session.pronoun.toLowerCase() + ' đã thành công.')
                        .then((res) => {
                            return this.sendTextMessage(senderId, `Vui lòng đợi trong ít phút nhân viên cửa hàng sẽ gọi điện cho ${this.session.pronoun.toLowerCase()}`)
                        })
                        .then((res) => this.sendTextMessage(senderId, 'Chúc ' + this.session.pronoun.toLowerCase() + ' một ngày vui vẻ'));
                })
                .catch((err) => {
                    console.log(err);
                })
            this.step = 26;
            this.continue(input, senderId);
        } else if (input.match(/(ko|không|hủy|thôi|kg|no|nô)/i)) {
            if (this.session.orderDialog.cancelLoop == 1) {
                this.sendTextMessage(senderId, `Ủa là sao ${this.session.pronoun.toLowerCase()}?`)
                    .then((res) => {
                        this.sendTextMessage(senderId, `Sao tự nhiên hổng đặt nữa? ${this.session.pronoun} muốn hủy hả?`);
                    })
                this.step = 29.1;
            } else {
                this.sendTextMessage(senderId, `Ok hủy đơn hàng`)
                    .then((res) => {
                        return this.sendTextMessage(senderId, `Rẹt rẹt`);
                    })
                    .then((res) => {
                        return this.sendTextMessage(senderId, `Xong, đã hủy`);
                    })
                    .then((res) => {
                        this.sendTextMessage(senderId, `Cám ơn ${this.session.pronoun.toLowerCase()} đã ghé thăm gian hàng của em :*`);
                    })
                this.step = 30;
                this.continue('', '');
            }
        }
    }

    /**
     * Step 29.1
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveCancelConfirmation(input, senderId) {
        if (input.match(/(ừ|hủy|ừm|ừn|uhm|uh|đúng)/i)) {
            this.sendTextMessage(senderId, `Dạ vậy hủy`)
                .then((res) => this.sendTextMessage(senderId, `:'( :'( :'(`));
            this.step = 30;
            this.continue('', '');
        } else {
            this.sendTextMessage(senderId, `Là sao?`)
                .then((res) => {
                    return this.sendTextMessage(senderId, `Vậy là có đặt hàng hông?`)
                })
                .then((res) => {
                    this.sendTextMessage(senderId, `Đặt hàng thì hãy say yes, hông đặt thì say no nhé >:O`)
                })
            this.step = 29;
            ++this.session.orderDialog.cancelLoop;
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
                    that.whenUserOrderTooMuch(product.quantity, senderId)
                        .then((response) => {
                            that.insertProductToOrder(product.simplify());
                            that.session.orderDialog.currentProduct = product;
                            that.step = 6;
                            that.reply(senderId,
                                new SimpleTextTemplate('Ok ' + info.quantity + ' phần ' + info.productName).template)
                                .then(function (data) {
                                    that.continue(input, senderId);
                                });
                            that.exception = 0;
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
                                    payload: "Đặt $" + result[i].ProductID + " $" + result[i].ProductName + " $" + result[i].Price + " $" + result[i].PicURL + " $" + result[i].ProductCode + " $" + that.session.brandId,
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
                this.sendTextMessage(senderId, `Ok vậy em chọn khuyến mãi ${info.promotionCode} ha.`);
                this.step = 15;
                this.continue(input, senderId);
            });
    }


    confirmCancelPromotion(senderId) {
        this.sendTextMessage(senderId, "" + this.session.pronoun + " à, sao " + this.session.pronoun.toLowerCase() + " lại ko áp dụng khuyến mãi nữa?")
            .then((data) => {
                this.sendTextMessage(senderId, "Xài khuyến mãi đi, được giảm giá mà")
                    .then((data) => {
                        this.sendQuickReply(senderId, "" + this.session.pronoun + " có chắc là hông muốn áp dụng khuyến mãi chứ? :'<",
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

    receiveProductName(input, sender, info) {
        this.step = 3;
        this.continue(info.productName, sender, info);
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

        this.reply(senderId, new SimpleTextTemplate(`Nhập số tự nhiên lớn hơn 0 thôi nha ${this.session.pronoun.toLowerCase()} 😱😱😱`).template).then(
            function (data) {
                that.step = step;
            }
        );
    }

    /**
     * Báo lỗi yêu cầu nhập số > 0
     * @param {int} step Step để trở về sau khi báo lỗi
     * @param {int} senderId 
     */
    requireGreaterThanZero(step, senderId) {
        var that = this;

        this.reply(senderId, new SimpleTextTemplate(`Nhập số lớn hơn 0 nha ${this.session.pronoun.toLowerCase()}`).template).then(
            function (data) {
                that.step = step;
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
            this.sendTextMessage(senderId, "" + this.session.pronoun + " đã áp dụng khuyến mãi này rồi đó. Nãy " + this.session.pronoun.toLowerCase() + " mới bấm kìa");
        } else {
            this.sendQuickReply(senderId, `Nãy ${this.session.pronoun.toLowerCase()} áp dụng khuyến mãi ${currentPromotion.PromotionCode} rồi ấy. ${this.session.pronoun} muốn đổi lại khuyến mãi ${info.promotionCode} hả?`,
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
     * @param {[{productId, productName, price, discountPrice, quantity, productCode, extras: [ProductModel]}]} listProduct 
     */
    calculateTotalPrice(listProduct) {
        var total = 0;
        let condition = listProduct.length;
        for (let i = 0; i < condition; i++) {
            total += (parseInt(listProduct[i].discountPrice) * listProduct[i].quantity)
            if (listProduct[i].extras.length > 0) {
                let condition2 = listProduct[i].extras.length;
                for (let j = 0; j < condition; j++) {
                    total += parseInt(listProduct[i].extras[j].quantity) * parseInt(listProduct[i].extras[j].price);
                }
            }
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
        this.session.orderDialog.finalPrice = this.session.orderDialog.originalPrice;
        data.some(function (element) {
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
            } else if (that.session.orderDialog.originalPrice >= element.MinOrderAmount && (that.session.orderDialog.originalPrice < element.MaxOrderAmount || element.MaxOrderAmount == null)) {
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
     * @param {string} a 
     * @param {string} b 
     */
    levenshteinDistance(a, b) {
        var string1 = a.toLowerCase();
        var string2 = b.toLowerCase()
        var length1 = string1.length;
        var length2 = string2.length;
        if (length1 == 0) return length2;
        if (length2 == 0) return length1;
        var d = []
        var i, j;
        //i là cột
        for (i = 0; i <= length2; i++) {
            d[i] = [i];
        }
        //j là dòng
        for (j = 0; j <= length1; j++) {
            d[0][j] = j
        }
        for (i = 1; i <= length2; i++) {
            for (j = 1; j <= length1; j++) {
                if (string2.charAt(i - 1) == string1.charAt(j - 1)) {
                    d[i][j] = d[i - 1][j - 1]
                } else {
                    d[i][j] = Math.min(d[i - 1][j - 1] + 1, // substitution
                        Math.min(d[i][j - 1] + 1, // insertion
                            d[i - 1][j] + 1));
                }
            }
        }
        console.log(d[length2][length1])
        return d[length2][length1];
    }

    bubbleSort(array) {
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array.length; j++) {
                if (array[i].ed < array[j].ed) {
                    let temp = array[i]
                    array[i] = array[j];
                    array[j] = temp;
                }
            }

        }
    }

    /**
     * @returns {Promise}
     */
    getAllStoreByBrand(input) {
        return new Request().sendGetRequest('/LBFC/Brand/GetAllStores', { 'brandId': this.session.brandId }, "")
            .then((data) => {
                var result = {};
                var listStoreByBrand = JSON.parse(data)
                var listStoreMatching = []
                var store = {};
                var storeId = null;
                var storeName = null;
                for (var i = 0; i < listStoreByBrand.length; i++) {
                    ConsoleLog.log(listStoreByBrand[i], this.getName(), 1048);
                    if (this.levenshteinDistance(input, listStoreByBrand[i].Name) <= Math.floor(listStoreByBrand[i].Name.split(" ", 10).length * 1.5)) {
                        store = {
                            storeId: listStoreByBrand[i].ID,
                            storeName: listStoreByBrand[i].Name
                        }
                        listStoreMatching.push(store)
                    } else if (this.levenshteinDistance(input, listStoreByBrand[i].Name) == 0) {
                        store.name = listStoreByBrand[i].Name;
                        store.Id = listStoreByBrand[i].ID;
                        result = {
                            storeId: store.Id,
                            storeName: store.name,
                        }
                        break;
                    }
                }
                if (result.storeId == undefined) {
                    result = {
                        listStoreMatching,
                    }
                }
                return result;
            })
    }

    insertMembershipCard(cardCode, senderId) {
        let params = {
            cardCode,
            facebookPSID: senderId,
        }
        ConsoleLog.log(params, this.getName(), 1408);
        return new Request().sendPostRequest('/LBFC/Membership/InsertFacebookPSID', params);
    }

    getName() {
        return "order dialog";
    }

    reset() {
        this.session.orderDialog = {};
        this.session.orderDialog.currentPromotion = null;
        this.session.orderDialog.orderDetails = [];
        this.session.orderDialog.finalPrice = this.session.orderDialog.originalPrice = 0;

        /**
         * @type {{ProductModel}}
         */
        this.session.orderDialog.currentProduct = {};
        super.reset();
    }


}

module.exports = OrderDialog;