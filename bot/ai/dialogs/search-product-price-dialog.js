let Dialog = require('./dialog');
let SearchProductByPriceIntent = require('../intents/products/search-product-by-price-intent');
let Request = require('../utils/request');

class SearchProductNameDialog extends Dialog {
    constructor(session) {
        super(session);
        this.session.searchProductPriceDialog = {};
        this.push();
    }

    push() {
        this.addIntent(new SearchProductByPriceIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        switch(this.step) {
            case 1: this.askForBottomPrice(senderId); break;
            case 2: this.receiveBottomPrice(input, senderId); break;
            case 3: this.askForTopPrice(senderId); break;
            case 4: this.receiveTopPrice(input, senderId); break;
            case 5: this.search(input, senderId); break;
            case 6: this.end(); break;
            default: break;
        }
    }

    continueException(input, senderId, info = null) {
        switch(this.exception) {
            
        }
    }

    /**
     * Step 1
     * @param {*} senderId 
     */
    askForBottomPrice(senderId) {
        this.sendTextMessage(senderId, "Nhập giá thấp nhất");
        this.step = 2;
    }

    /**
     * Step 2
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveBottomPrice(input, senderId) {
        this.session.searchProductPriceDialog.bottomPrice = input;
        this.step = 3;
        this.continue(input, senderId);
    }

    /**
     * Step 3
     * @param {*} senderId 
     */
    askForTopPrice(senderId) {
        this.sendTextMessage(senderId, "Nhập giá tối đa");
        this.step = 4;
    }

    /**
     * Step 4
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveTopPrice(input, senderId) {
        this.session.searchProductPriceDialog.topPrice = input;
        this.step = 5;
        this.continue(input, senderId);
    }

    /**
     * Step 5
     * @param {*} input 
     * @param {*} senderId 
     */
    search(input, senderId) {
        var that = this;
        var params = { 
            'from': this.session.searchProductPriceDialog.bottomPrice, 
            'to' : this.session.searchProductPriceDialog.topPrice
        }

        new Request().sendGetRequest('/LBFC/Product/GetBrandHasProductInRange', params, "")
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
            that.step = 6;
            that.continue(input, senderId);
        });
    }


    end() {
        this.session.searchProductDialog = null;
        super.end();
    }

    getName() {
        return "search product price dialog";
    }
}

module.exports = SearchProductNameDialog