// var Order = require('./entities/order');
let Dialog = require('./dialog');
// let Pattern = require('../intents/patterns/pattern');
// let ClassParser = require('../utils/class-parser');
let Request = require('../utils/request');
let ConsoleLog = require('../utils/console-log');
var await = require('asyncawait/await')

/*-------------------Import intents-------------------*/
let ReceiveFullOrderIntent = require('../intents/orders/receive-full-order-intent');
let BeginOrderIntent = require('../intents/orders/begin-order-intent');
let PostbackOrderIntent = require('../intents/orders/postback-order-intent');
let ReceiveStoreNameIntent = require('../intents/orders/receive-store-name-intent')
/*----------------------------------------------------*/

/*-------------------Template-------------------------*/
let SimpleTextTemplate = require('./templates/simple-text-template');
let ButtonTemplate = require('./templates/button-template');

class OrderDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new ReceiveFullOrderIntent(0, 1));
        this.addIntent(new BeginOrderIntent(2, 0));
        this.addIntent(new PostbackOrderIntent(0, 2));
        this.addIntent(new ReceiveStoreNameIntent(12, 0, this.session));

    }

    continue(input, senderId, info = null) {
        console.log("đang ở order dialog")
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
            case 9: this.askCurrentLocation(input, senderId); break;
            case 10: this.receiveCurrentLocation(input, senderId); break;
            case 11: this.askStore(input, senderId); break;
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
        this.sendTextMessage(senderId, 'Bạn muốn gọi thêm món gì? ^.^');

    }

    /**
     *  Nhận tên của sản phẩm user muốn order
     * @param {string} input tên của sản phẩm
     * @param {*} senderId 
     */
    receiveProduct(input, senderId) {
        let that = this;
        this.sendTyping(senderId);
        if (input != null) {
            this.sendTyping(senderId);
            var data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProduct', { 'keyword': input }, ""))
            if (data.length == 0) {
                output = "Hệ thống không có món đó";
            } else {
                var listProduct = JSON.parse(data);
                let condition = listProduct.length;
                if (listProduct.length > 4) {
                    condition = 4
                } else if (listProduct.length > 0 && listProduct.length < 4) {
                    condition = listProduct.length
                }
                var top4Product = [];
                for (var i = 0; i < condition; i++) {
                    var element = {
                        title: listProduct[i].Product.ProductName,
                        image_url: listProduct[i].Product.PicURL,
                        subtitle: listProduct[i].Product.Price + "VND",
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
                                payload: "Đặt $" + listProduct[i].Product.ProductID + " $" + listProduct[i].Product.ProductName + " $" + listProduct[i].Product.Price + " $" + listProduct[i].Product.PicURL + " $" + listProduct[i].Id,
                            }
                        ]
                    }
                    top4Product.push(element);
                }
                that.sendGenericMessage(senderId, top4Product)
            }
        };
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
     * Step 5: Nhận số lượng món hàng mà user muốn.
     * Current step = 5.
     * Cú pháp: \\d+
     * @param {string} input Số phần mà user nhập vào
     * @param {int} senderId id fb của user
     */
    receiveQuantity(input, senderId) {
        console.log(this.session)
        var currentProduct = this.session.products[this.session.totalProductInList - 1]
        var that = this;
        if (input.match(/^\d+$/g)) {
            currentProduct.quantity = input
            this.step = 6;
            this.reply(senderId,
                new SimpleTextTemplate('Ok ' + input + ' phần ' + currentProduct.productName).template)
                .then(function (data) {
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
     * Step 9: Nhận phương thức giao hàng từ user và hỏi current location
     * @param {*} input 
     * @param {*} senderId 
     */
    askCurrentLocation(input, senderId) {
        let that = this;
        if (input.match(/tại cửa hàng/i)) {
            that.step = 10
            that.sendLocation(senderId);
        } else if (input.match(/(delivery|giao hàng)/i)) {
            that.step = 12.4
            that.sendTextMessage(senderId, "Bạn muốn giao hàng đến địa chỉ nào?")
        }
    }

    /**
     * Step 10: Nhận current location của user
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveCurrentLocation(input, senderId) {
        this.step = 11;
        let that = this;
        if (input.constructor === Array) {
            var coordinates = input[0].payload.coordinates
            that.session.coordinates = coordinates;
            that.continue(input, senderId);
        } else {
            that.sendTextMessage(senderId, "Cửa hàng ở đâu thì thuận tiện cho bạn?")
        }


    }
    /**
     * Step 11: Nhận xem là user muốn tới lấy hay được giao
     * @param {string} input 
     * @param {number} senderId 
     */
    askStore(input, senderId) {
        let that = this;

        if (that.session.coordinates) {
            that.step = 12
            let currentProduct = this.session.products[this.session.totalProductInList - 1]
            let data = await(new Request().sendGetRequest('/LBFC/Store/GetNearbyStoreOutdoor', { "lat": this.session.coordinates.lat, "lon": this.session.coordinates.long, "brandId": this.session.products[this.session.totalProductInList - 1].brandId }))
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
            that.sendGenericMessage(senderId, top4NearByStore)
        } else {
            let currentProduct = this.session.products[this.session.totalProductInList - 1]
            let data = await(new Request().sendGetRequest('/LBFC/Store/GetAllStoresByBrand', { 'brandId': currentProduct.brandId }, ""))
            let listStoreByBrand = JSON.parse(data);
            let that = this;
            let listStoreMatching = []
            let replyText = "";
            for (var i = 0; i < listStoreByBrand.length; i++) {
                if (that.levenshteinDistance(input, listStoreByBrand[i].Name) <= 10) {
                    let store = {
                        storeId: listStoreByBrand[i].Id,
                        storeName: listStoreByBrand[i].Name,
                        ed: this.levenshteinDistance(input, listStoreByBrand[i].Name)
                    }
                    listStoreMatching.push(store)
                }
            }
            that.bubbleSort(listStoreMatching)
            //console.log(listStoreMatching)
            if (listStoreMatching.length == 1) {
                that.step = 12.1;
                that.session.address = listStoreMatching[0].storeName
                that.sendTextMessage(senderId, "Có phải ý của bạn là cửa hàng " + listStoreMatching[0].storeName)

            } else if (listStoreMatching.length > 1) {
                for (var i = 0; i < listStoreMatching.length; i++) {
                    replyText += (i + 1) + ". " + listStoreMatching[i].storeName + "\n"
                }
                that.sendTextMessage(senderId, "Ý của bạn là cửa hàng nào?")
                that.sendTextMessage(senderId, replyText)
                that.step = 12.3;
            } else if (listStoreMatching.length < 1) {
                that.sendTextMessage(senderId, "Xin lỗi cửa hàng này không có trong hệ thống! Vui lòng chọn cửa hàng khác ^.^")
            }
        }
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
        let replyText = "";
        let listStoreMatching = [];
        if (info != null) {
            //Nếu user click button "Chọn cửa hàng"
            if (info.storeId && info.storeName) {
                that.step = 13;
                let storeId = info.storeId;
                let storeName = info.storeName;
                that.session.address = storeName;
                that.sendTextMessage(senderId, "Bạn kiểm tra lại đơn hàng nhé")
                that.continue(input, senderId);
            }
            //Nếu user nhập tay tên cửa hàng
            else if (info.listStoreMatching) {
                listStoreMatching = info.listStoreMatching;

                that.bubbleSort(listStoreMatching)
                if (listStoreMatching.length == 1) {
                    that.step = 12.1;
                    that.session.address = listStoreMatching[0].storeName
                    that.sendTextMessage(senderId, "Có phải ý của bạn là cửa hàng " + listStoreMatching[0].storeName)

                } else if (listStoreMatching.length > 1) {
                    for (var i = 0; i < listStoreMatching.length; i++) {
                        replyText += (i + 1) + ". " + listStoreMatching[i].storeName + "\n"
                    }
                    that.sendTextMessage(senderId, "Ý của bạn là cửa hàng nào?")
                    that.sendTextMessage(senderId, replyText)
                    that.step = 12.2;
                } else if (listStoreMatching.length < 1) {
                    that.sendTextMessage(senderId, "Xin lỗi cửa hàng này không có trong hệ thống! Vui lòng chọn cửa hàng khác ^.^")
                }
            }
        } else {
            let currentProduct = this.session.products[this.session.totalProductInList - 1]
            let data = await(new Request().sendGetRequest('/LBFC/Store/GetAllStoresByBrand', { 'brandId': currentProduct.brandId }, ""))
            let listStoreByBrand = JSON.parse(data);
            for (var i = 0; i < listStoreByBrand.length; i++) {
                if (that.levenshteinDistance(input, listStoreByBrand[i].Name) <= 10) {
                    let store = {
                        storeId: listStoreByBrand[i].Id,
                        storeName: listStoreByBrand[i].Name,
                        ed: this.levenshteinDistance(input, listStoreByBrand[i].Name)
                    }
                    listStoreMatching.push(store)
                }
            }
            that.bubbleSort(listStoreMatching)
            //console.log(listStoreMatching)
            if (listStoreMatching.length == 1) {
                that.step = 12.1;
                that.session.address = listStoreMatching[0].storeName
                that.sendTextMessage(senderId, "Có phải ý của bạn là cửa hàng " + listStoreMatching[0].storeName)

            } else if (listStoreMatching.length > 1) {
                for (var i = 0; i < listStoreMatching.length; i++) {
                    replyText += (i + 1) + ". " + listStoreMatching[i].storeName + "\n"
                }
                that.sendTextMessage(senderId, "Ý của bạn là cửa hàng nào?")
                that.sendTextMessage(senderId, replyText)
                that.step = 12.3;
            } else if (listStoreMatching.length < 1) {
                that.sendTextMessage(senderId, "Xin lỗi cửa hàng này không có trong hệ thống! Vui lòng chọn cửa hàng khác ^.^")
            }
        }
    }

    /**
     * Step 12.2
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveConfirmStore(input, senderId) {
        console.log("đã chạy vào hàm receiveConfirmStore")
        var that = this;
        if (input.match(/(ok|đúng rồi|đúng|chính nó|nó đó|chuẩn luôn|chính xác)/i)) {
            that.step = 13
            that.continue(input, senderId)
        } else if (input.match(/(ko|không|sai rồi|nhầm|lộn)/i)) {
            that.sendTextMessage(senderId, "Nếu ko phải " + that.session.address + " thì là cửa hàng nào?")
        }
    }

    /**
     * Step 12.3: Nhận được tên cửa hàng đã được sửa lại
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveEditStoreName(input, senderId) {
        this.step = 12;
        this.continue(input, senderId)
    }

    /**step 12.4 */
    receiveDeliveryAdrress(input, senderId) {
        this.sendTextMessage(senderId, "Bạn kiểm tra lại đơn hàng giúp mình nhé")
        this.session.address = input;
        this.step = 13;
        this.continue(input, senderId);
    }

    /**
     * Step 13: confirm lại order
     * @param {number} senderId 
     */
    askForConfirmation(input, senderId) {
        this.step = 15
        var that = this;
        var sender = await(this.getSenderName(senderId))

        var recipientName = sender.first_name + " " + sender.last_name;
        var orderNumber = "1234";
        var total = that.calculateTotalPrice(this.session.products)
        var orderUrl = "https://tiki.vn/sales/order/view?code=75179106"
        var address = {
            street_1: that.session.address,
            street_2: "",
            city: "TP.HCM",
            postal_code: "700000",
            state: "TP.HCM",
            country: "VN"
        }
        var summary = {
            subtotal: 0.00,
            shipping_cost: 0.00,
            total_tax: 0.00,
            total_cost: total
        }
        var adjustments = [
            {
                name: "abc",
                amount: 1
            }
        ]
        var elements = []
        for (var i = 0; i < that.session.products.length; i++) {
            var element = {
                title: that.session.products[i].productName,
                subtitle: "Sản phẩm được làm từ abc xyz",
                quantity: that.session.products[i].quantity,
                price: that.session.products[i].price.trim() + ".00",
                currency: "VND",
                image_url: that.session.products[i].productUrl
            }
            elements.push(element)
        }
        this.sendReceipt(senderId, recipientName, orderNumber, orderUrl, address, summary, adjustments, elements)
            .then(function (data) {
                that.sendTextMessage(senderId, 'Đồng ý đặt hàng?');
            });
    }

    /**
     * Step 11: Nhận coi user có đồng ý đặt hàng không
     * @param {string} input 
     * @param {number} senderId 
     */
    receiveConfirmation(input, senderId) {
        if (input.match(/(ok|đồng ý|đúng rồi|có|yes)/i)) {
            this.sendTextMessage(senderId, 'Đơn hàng của bạn đã thành công.')
            this.sendTextMessage(senderId, 'Vui lòng đợi trong ít phút nhân viên cửa hàng sẽ gọi điện cho bạn')
            this.sendTextMessage(senderId, 'Chúc bạn một ngày vui vẻ')
            this.step = 14;
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
        var count = 0
        if (!this.session.products) {
            this.session.products = [];
        } else {
            count = this.session.totalProductInList
        }
        this.session.products.push(
            {
                productId: info.productId,
                productName: info.productName,
                price: info.price,
                productUrl: info.productUrl,
                brandId: info.brandId
            }
        )
        this.session.totalProductInList = count + 1;
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

    levenshteinDistance(a, b) {
        console.log(a)
        console.log(b)
        var string1 = a.toLowerCase()
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

}

module.exports = OrderDialog;