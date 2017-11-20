let Dialog = require('./dialog');
let Request = require('../utils/request');
let ConsoleLog = require('../utils/console-log');
var Await = require('asyncawait/await')
var Async = require('asyncawait/async');
let ProductModel = require('./entities/products/product');

/*-------------------Import intents-------------------*/
const ReceiveFullOrderIntent = require('../intents/orders/receive-full-order-intent');
const BeginOrderIntent = require('../intents/orders/begin-order-intent');
const PostbackOrderIntent = require('../intents/orders/postback-order-intent');
const ReceiveStoreNameIntent = require('../intents/orders/receive-store-name-intent')
const PostbackApplyPromotion = require('../intents/promotions/postback-apply-promotion-intent');
const PostbackChangePromotionIntent = require('../intents/promotions/postback-change-promotion-intent');
const CancelApplyPromotionIntent = require('../intents/promotions/cancel-apply-promotion-intent');
let AddExtraIntent = require('../intents/orders/add-extra-intent')
const RequestFinishOrderIntent = require('../intents/orders/request-finish-order-intent');

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
        this.addIntent(new ReceiveStoreNameIntent(20, 0, this.session));
        this.addIntent(new PostbackApplyPromotion(14, 0));
        this.addIntent(new PostbackChangePromotionIntent(0, 3));
        this.addIntent(new CancelApplyPromotionIntent(0, 4));
        this.addIntent(new AddExtraIntent(7, 0));
        this.addIntent(new RequestFinishOrderIntent(13, 0));
    }

    continue(input, senderId, info = null) {
        ConsoleLog.log(`info = ${info}`, this.getName(), 52);
        console.log('STEP = ' + this.step)
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
            case 10: this.receiveExtraBelongToWhichProduct(input, senderId); break;
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
            case 19.1: this.askStoreNameAfterShowStoreSystem(input, senderId); break;
            case 20: this.receiveStore(input, senderId, info); break;
            case 20.1: this.receiveConfirmStore(input, senderId); break;
            case 20.2: this.receiveEditStoreName(input, senderId); break;
            case 20.3: this.receiveLocation(input, senderId); break;
            case 20.4: this.receiveDeliveryAdrress(input, senderId); break;
            case 21: this.askPhoneNumber(input, senderId); break;
            case 22: this.receivePhoneNumber(input, senderId); break;
            case 23: this.askForConfirmation(input, senderId); break;
            case 24: this.receiveConfirmation(input, senderId); break;
            case 25: this.end(); break;
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
        this.sendTextMessage(senderId, this.session.pronoun + ' muốn gọi thêm món gì? ^.^');


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
                if (data.length < 1) {
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
        var currentProduct = this.session.orderDialog.currentProduct;
        var that = this;
        if (input.match(/^\d+$/g)) {
            currentProduct.quantity = parseInt(input);

            this.step = 6;
            this.insertProductToOrder(currentProduct.simplify());
            ConsoleLog.log(currentProduct, this.getName(), 214);
            this.sendTextMessage(senderId, 'Ok ' + input + ' phần ' + currentProduct.productName);
            this.continue(input, senderId);
        } else {
            this.requireNumber(4, senderId);
        }
    }

    /**
    * Step 6: Ask extra
    * @param {*} senderId
    * if(data != null) => receiveExtraProduct() else => askForMore() 
    */
    askExtraProduct(input, senderId) {
        let that = this;
        let currentProduct = this.session.orderDialog.currentProduct;
        new Request().sendGetRequest('/LBFC/Product/GetProductExtra', { 'productId': currentProduct.productID }, "")
            .then((data) => {
                let listExtraProduct;
                if (data != null) {
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
            });

    }

    /**
     * Step 7 : receive extra info from user
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} info 
     */
    receiveExtra(input, senderId, info) {
        ConsoleLog.log(input, this.getName(), 288);
        if (input.match(/^(không|ko|nô|không muốn|không áp dụng|ko mua|không mua|kg)/i)) {
            this.step = 9;
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
            this.sendQuickReply(senderId, 'Thêm bao nhiêu phẩn ' + info.productName.toLowerCase() + ' vậy ' + this.session.pronoun.toLowerCase(),
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
        console.log(input)
        console.log(currentExtra)
        if (input.match(/\d+/g)) {
            this.step = 9;
            currentExtra.quantity = input;
            this.sendTextMessage(senderId, 'Vâng, thêm ' + input + ' phần ' + currentExtra.productName)
                .then((response) => {
                    this.continue(input, senderId)
                })
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
        console.log('CURRENT PRIDUCT = \n' + JSON.stringify(this.session))
        let currentExtra = currentProduct.extras[currentProduct.extras.length - 1];
        if(currentProduct.quantity == 1) {
            this.step = 11
        } else if(currentProduct.quantity > 1) {
            this.step = 10;
            this.sendTextMessage(senderId, `${currentProduct.quantity} phần ${currentProduct.productName} đều thêm ${currentExtra.quantity} phần ${currentExtra.productName} hay sao ${this.session.pronoun}?`);
            currentProduct.note  = `(Mỗi phần ${currentProduct.quantity} đều thêm ${currentExtra.quantity} phần ${currentExtra.productName})`;
        }
    }

    /**
     * Step 10:
     * Nhận câu trả lời extra add thêm vào sản phẩm nào => askForMore()
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveExtraBelongToWhichProductAgain(input, senderId) {
        let currentProduct = this.session.orderDialog.currentProduct;
        let currentExtra = currentProduct.extras[currentProduct.extras.length - 1];
        if (input.match(/(đúng rồi|phải|nó đó|ok|đúng|chính xác)/i)) {
            this.step = 11
            this.continue(input, senderId);
        } else if (input.match(/(ko|ko phải|k|không|kg|thôi|sai rồi|sai|nô|no)/i)) {
            this.step = 10.1
            this.sendTextMessage(senderId, `Vậy ${this.session.pronoun.toLowerCase()} vui lòng nói rõ ra giúp em với`)
            this.sendImage(senderId, 'https://scontent.fsgn5-4.fna.fbcdn.net/v/t39.1997-6/s180x540/851586_126362030881927_2101660857_n.png?oh=0181b749a21a71a484eefad6c7d0e655&oe=5AA118D9')
        }
    }
    /**
     * Step 10.1:
     * Nhận câu trả lời extra add thêm vào sản phẩm nào => askForMore()
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveExtraBelongToWhichProduct(input, senderId) {
        this.step = 11;
        let currentProduct = this.session.orderDialog.currentProduct;
        currentProduct.note = input;
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
        var data = {
            "order": {
                "OrderDetails": this.session.orderDialog.orderDetails,
                "originalPrice": this.session.orderDialog.originalPrice,
            }
        }
        this.sendTextMessage(senderId, "Bên em có một số chương trình khuyến mãi nè.");
        new Request().sendPostRequest("/LBFC/Promotion/GetSuitablePromotions", data)
            .then(function (dataStr) {
                console.log(dataStr)
                if (dataStr != undefined && dataStr.length > 0) {
                    var data = JSON.parse(dataStr);
                    var s = that.session.pronoun + " có muốn xài mấy khuyến mãi dưới này ko?\n";
                    that.showPromotion(data, senderId)
                }
            });
    }

    showPromotion(promotions, senderId) {
        var elements = [];
        let condition = promotions.length
        if (condition <= 4) {

        } else {
            condition = 4
        }
        console.log("CONDITION = " + condition)
        for (let i = 0; i < condition; i++) {
            let element = {
                title: promotions[i].Name,
                image_url: promotions[i].ImageURL,
                subtitle: promotions[i].Description,
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
                        payload: "promotion select $" + promotions[i].Code,
                    }
                ]
            }
            elements.push(element);
        }
        return this.sendGenericMessage(senderId, elements)
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
        if (input.match(/^promotion select \$/i)) {
            if (this.session.orderDialog.orderDetails == 0) {
                this.sendTextMessage(senderId, `${this.session.pronoun} vui lòng đặt hàng trước giùm em nhe`)
                    .then((response) => {
                        this.sendEmoji(senderId)
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
                            that.sendTextMessage(senderId, "Khuyến mãi này hông áp dụng được " + that.session.pronoun.toLowerCase() + " ơi. Bạn coi mấy khuyến mãi khác giùm mình nha.")
                                .then((response) => {
                                    that.step = 13;
                                    that.continue(input, senderId);
                                })
                        } else {
                            that.sendTextMessage(senderId, `Ok vậy ${that.session.pronoun.toLowerCase()} chọn khuyến mãi ${promotionCode} ha.`)
                                .then((response) => {
                                    this.sendEmoji(senderId);
                                    that.step = 15;
                                    that.continue(input, senderId);
                                })
                        }
                    });
            }
        } else {
            that.step = 13;
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
        this.sendLocation(senderId);
        this.step = 18;
    }


    /**
     * Step 18: Nhận current location của user
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveCurrentLocation(input, senderId) {
        console.log('INPUT = : ' + input)
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
        console.log(input)
        if (this.session.coordinates) {
            this.step = 20;
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
                            this.sendTextMessage(senderId, "Có phải ý của bạn là cửa hàng " + listStoreMatching[0].storeName)
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
     * @param {*} info 
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
        this.sendTextMessage(senderId, this.session.pronoun + " kiểm tra lại đơn hàng giúp em nhé")
        this.session.orderDialog.orderDetails = input;
        this.step = 21;
        this.continue(input, senderId);
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
        this.session.orderDialog.phoneNumber = input;
        this.step = 23;
        this.continue(input, senderId);
    }


    /**
     * Step 23: confirm lại order
     * @param {number} senderId 
     */
    askForConfirmation(input, senderId) {
        this.step = 24;
        var that = this;
        this.session.orderDialog.orderDetails.forEach(function (element) {
        }, this);
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
                var adjustments = [{}];
                if (this.session.orderDialog.currentPromotion.PromotionCode != undefined) {
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
                        title: that.session.orderDialog.orderDetails[i].productName + " \n" + that.session.orderDialog.currentProduct.note ,
                        // subtitle: that.session.orderDialog.orderDetails[i].,
                        quantity: parseInt(that.session.orderDialog.orderDetails[i].quantity),
                        price: parseInt(that.session.orderDialog.orderDetails[i].price),
                        currency: "VND",
                        image_url: that.session.orderDialog.orderDetails[i].productUrl
                    }
                    elements.push(element)
                }
                that.sendReceipt(senderId, recipientName, orderNumber, orderUrl, address, summary, adjustments, elements)
                    .then(function (data) {
                        that.sendTextMessage(senderId, 'Đặt luôn nhen ' + that.session.pronoun.toLowerCase());
                    });

            });

    }

    /**
     * Step 24: Nhận coi user có đồng ý đặt hàng không
     * @param {string} input 
     * @param {number} senderId 
     */
    receiveConfirmation(input, senderId) {
        if (input.match(/(ok|đồng ý|đúng rồi|có|yes)/i)) {
            this.order(senderId)
                .then((data) => {
                    this.sendTextMessage(senderId, 'Đơn hàng của ' + this.session.pronoun.toLowerCase() + ' đã thành công.')
                    this.sendTextMessage(senderId, 'Vui lòng đợi trong ít phút nhân viên cửa hàng sẽ gọi điện cho ' + this.session.pronoun.toLowerCase())
                    this.sendTextMessage(senderId, 'Chúc ' + this.session.pronoun.toLowerCase() + ' một ngày vui vẻ')
                })
                .catch((err) => {
                    console.log(err);
                })
            this.step = 25;
            this.continue(input, senderId);
        } else if (input.match(/(ko|không|hủy|thôi|kg)/i)) {
            this.sendTextMessage('Đơn hàng của ' + this.session.pronoun.toLowerCase() + ' đã bị hủy')
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
        console.log("RECEIVE PRODUCT POSTBACK")
        console.log(info)
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
                this.step = 19;
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
        this.reply(senderId, new SimpleTextTemplate('Số thôi thêm chữ em ko hiểu 😱😱😱').template).then(
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
        console.log("CALCULATE TOTAL PRICE TOTAL = " + total)
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
     * return new Promise
     */
    getAllStore() {
        return new Promise((resolve, reject) => {
            var listAllStore = new Request().sendGetRequest('/LBFC/Store/GetAllStoresByBrand', { 'brandId': 1 }, "")
            resolve(listAllStore)
        })
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