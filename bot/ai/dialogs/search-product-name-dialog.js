let Dialog = require('./dialog');
let SearchProductByNameIntent = require('../intents/products/search-product-by-name-intent');
let Request = require('../utils/request');

class SearchProductNameDialog extends Dialog {
    constructor(session) {
        super(session);
        this.session.searchProductDialog = {};
        this.push();
    }

    push() {
        this.addIntent(new SearchProductByNameIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        switch(this.step) {
            case 0: this.continueException(input, step, info); break;
            case 1: this.askForProductName(senderId); break;
            case 2: this.receiveProductName(input, senderId); break;
            case 3: this.askForPriceFilter(senderId); break;
            case 4: this.receivePriceFilterConfirmation(input, senderId); break;
            case 5: this.askForBottomPrice(senderId); break;
            case 6: this.receiveBottomPrice(input, senderId); break;
            case 7: this.askForTopPrice(senderId); break;
            case 8: this.receiveTopPrice(input, senderId); break;
            case 9: this.search(input, senderId); break;
            case 10: this.end(); break;
            default: break;
        }
    }

    continueException(input, senderId, info = null) {
        switch(this.exception) {

        }
    }

    /**
     * Step 1
     * @param {} senderId 
     */
    askForProductName(senderId) {
        this.sendTextMessage(senderId, "Bạn muốn tìm món gì?");
        this.step = 2;
    }

    /**
     * Step 2
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveProductName(input, senderId) {
        this.session.searchProductDialog.productName = input;
        this.step = 3;
        this.continue(input, senderId);
    }
    
    /**
     * Step 3
     * @param {*} senderId 
     */
    askForPriceFilter(senderId) {
        this.sendTextMessage(senderId, "Bạn có muốn lọc theo giá không?");
        this.step = 4;
    }


    /**
     * Step 4
     * @param {*} input 
     * @param {*} sender 
     */
    receivePriceFilterConfirmation(input, senderId) {
        if (input.match(/(không|ko|hông|nô|no)/i)) {
            this.step = 10;
        } else {
            this.step = 5;
        }
        this.continue(input, senderId);    
    }

    /**
     * Step 5
     * @param {*} senderId 
     */
    askForBottomPrice(senderId) {
        this.sendTextMessage(senderId, "Nhập giá thấp nhất");
        this.step = 6;
    }

    /**
     * Step 6
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveBottomPrice(input, senderId) {
        this.session.searchProductDialog.bottomPrice = input;
        this.step = 7;
        this.continue(input, senderId);
    }

    /**
     * Step 7
     * @param {*} senderId 
     */
    askForTopPrice(senderId) {
        this.sendTextMessage(senderId, "Nhập giá tối đa");
        this.step = 8;
    }

    /**
     * Step 8
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveTopPrice(input, senderId) {
        this.session.searchProductDialog.topPrice = input;
        this.step = 9;
        this.continue(input, senderId);
    }

    /**
     * Step 9
     * @param {*} input 
     * @param {*} senderId 
     */
    search(input, senderId) {

        var params = { 
            'keyword': this.session.searchProductDialog.productName, 
            'from': this.session.searchProductDialog.bottomPrice, 
            'to' : this.session.searchProductDialog.topPrice
        }
        var that = this;
        new Request().sendGetRequest('/LBFC/Product/GetBrandHasProduct', params, "")
        .then(function (data) {
            if (data.length == 0) {
                output = "Hệ thống không có món đó";
            } else {
                var listProduct = JSON.parse(data);
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
                                payload: "Đặt $" + listProduct[i].Product.ProductID + " $" + listProduct[i].Product.ProductName + " $" + listProduct[i].Product.Price + " $" + listProduct[i].Product.PicURL + " $" + listProduct[i].Id,
                            }
                        ]
                    }
                    top4Product.push(element);
                }
                that.sendGenericMessage(senderId, top4Product)
            }
            that.step = 10;
            that.continue(input, senderId);
        });
    }


    end() {
        this.session.searchProductDialog = null;
        super.end();
    }

    getName() {
        return "search product name dialog";
    }
}

module.exports = SearchProductNameDialog