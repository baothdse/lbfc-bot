let Dialog = require('./dialog');
let SearchProductByNameIntent = require('../intents/products/search-product-by-name-intent');
let SearchProductByNameSimpleIntent = require('../intents/products/search-product-by-name-simple-intent');
const SelectPriceRangeIntent = require('../intents/products/select-price-range-intent');
const SearchProductIntent = require('../intents/products/search-product-intent');
let Request = require('../utils/request');

class SearchProductNameDialog extends Dialog {
    constructor(session) {
        super(session);
        this.session.searchProductDialog = {};
        this.push();
    }

    push() {
        this.addIntent(new SearchProductByNameIntent(1, 0));
        this.addIntent(new SearchProductByNameSimpleIntent(1, 0));
        this.addIntent(new SelectPriceRangeIntent(0, 1));
        this.addIntent(new SearchProductIntent(1, 0));
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
            case 1: this.receiveFullPriceRange(info, senderId, info); break;
        }
    }

    /**
     * Step 1
     * @param {} senderId 
     */
    askForProductName(senderId) {
        this.sendTextMessage(senderId, `${this.session.pronoun} muốn tìm món gì?`);
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
            'from': this.session.searchProductDialog.bottomPrice == undefined ? 0 : this.session.searchProductDialog.bottomPrice, 
            'to' : this.session.searchProductDialog.topPrice == undefined ? 0 : this.session.searchProductDialog.topPrice,
            'brandId': this.session.brandId,
        }
        var that = this;
        new Request().sendGetRequest('/LBFC/Product/SearchProductInRange', params, "")
        .then(function (dataStr) {
            let data = JSON.parse(dataStr);
            if (data.length == 1) {
                that.showProducts(data);
            } else {
                that.sendTextMessage('Không thấy món bạn vừa kiếm, có phải ý bạn là...')
                .then((response) => {
                    that.showProducts(data);
                })
            }
        });
        that.step = 10;
        that.continue(input, senderId);
    }

    /*--------------------Exception--------------------*/
    
    /**
     * 
     * @param {*} input 
     * @param {*} senderId 
     * @param {{fromPrice, toPrice}} info 
     */
    receiveFullPriceRange(input, senderId, info) {
        this.session.searchProductDialog.bottomPrice = info.fromPrice;
        this.session.searchProductDialog.topPrice = info.toPrice;
        this.search(input, senderId);
    }

    /*---------------Private method------------------*/

    /**
     * 
     * @param {[]} products 
     * @param {*} senderId 
     */
    showProducts(products, senderId) {
        var elements = [];
        for (var i = 0; i < products.length; i++) {
            var element = {
                title: products[i].ProductName,
                image_url: products[i].PicURL,
                subtitle: products[i].ProductName,
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
                        payload: "Đặt $" + products[i].ProductID + " $" + products[i].ProductName + " $" + products[i].Price + " $" + products[i].PicURL + " $" + products[i].ProductCode + " $" + this.session.brandId,
                    }
                ]
            }
            elements.push(element);
        }
        return this.sendGenericMessage(senderId, elements);
    }

    end() {
        this.session.searchProductDialog = null;
        super.end();
    }

    reset() {
        super.reset();
        this.session.searchProductDialog = {};
    }

    getName() {
        return "search product name dialog";
    }
}

module.exports = SearchProductNameDialog