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
        this.addIntent(new SelectPriceRangeIntent(4, 0));
        this.addIntent(new SearchProductIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        console.log('STANDING AT STEP : ' + this.step)
        switch (this.step) {
            case 0: this.continueException(input, step, info); break;
            case 1: this.askForProductName(senderId); break;
            case 2: this.receiveProductName(input, senderId); break;
            case 3: this.askForPriceFilter(senderId); break;
            case 4: this.receivePriceFilterConfirmation(input, senderId, info); break;
            case 5: this.showProducts(input, senderId); break;
            case 6: this.end(); break;
            default: break;
        }
    }

    continueException(input, senderId, info = null) {
        switch (this.exception) {
            case 1: this.receiveFullPriceRange(info, senderId, info); break;
        }
    }

    /**
     * Step 1
     * @param {} senderId 
     */
    askForProductName(senderId) {
        this.sendTextMessage(senderId, this.session.pronoun + " muốn tìm món gì?");
        this.sendEmoji(senderId)
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
        let replyMessageArr = [this.session.pronoun + ' muốn dùng sản phẩm trong tầm giá nào?', this.session.pronoun + ' muốn sản phẩm này khoảng bao nhiêu tiền?', 'Khoảng bao nhiêu tiền thì phù hợp với ' + this.session.pronoun.toLowerCase()]
        let reply = this.randomReplyMessage(replyMessageArr);
        this.sendQuickReply(senderId, reply,
            [{
                content_type: "text",
                title: "20k-30k",
                payload: "20k-30k",
                image_url: "https://thumbs.dreamstime.com/b/flat-vector-money-icon-dollar-long-shadow-isolated-white-background-39939483.jpg"
            }, {
                content_type: "text",
                title: "30k-40k",
                payload: "30k-40k",
                image_url: "https://thumbs.dreamstime.com/b/flat-vector-money-icon-dollar-long-shadow-isolated-white-background-39939483.jpg"
            }, {
                content_type: "text",
                title: "Bỏ qua",
                payload: "Bỏ qua",
                image_url: "https://cdn3.iconfinder.com/data/icons/interaction-design/512/ignore2-512.png"
            }]);
        this.step = 4;
    }


    /**
     * Step 4
     * @param {*} input 
     * @param {*} sender 
     */
    receivePriceFilterConfirmation(input, senderId, info) {
        var that = this;
        console.log(info)
        if (input.match(/(không|ko|hông|nô|no|bỏ qua|khỏi|thôi)/i)) {
            var params = {
                'keyword': this.session.searchProductDialog.productName,
                'from': 0,
                'to': 1000000,
                'brandId': 1,
            }
            new Request().sendGetRequest('/LBFC/Product/SearchProductInRange', params, '')
                .then((data) => {
                    let listProduct = JSON.parse(data);
                    that.showProducts(listProduct, senderId);
                })
            this.showProducts()
            this.step = 6;
        } else {
            this.step = 6;
            // var params = {
            //     'keyword': this.session.searchProductDialog.productName,
            //     'from': this.session.searchProductDialog.bottomPrice == undefined ? 0 : this.session.searchProductDialog.bottomPrice,
            //     'to': this.session.searchProductDialog.topPrice == undefined ? 0 : this.session.searchProductDialog.topPrice,
            //     'brandId': this.session.brandId,
            // }
            var params = {
                'keyword': this.session.searchProductDialog.productName,
                'from': info.fromPrice,
                'to': info.toPrice,
                'brandId': 1,
            }
            
            new Request().sendGetRequest('/LBFC/Product/SearchProductInRange', params, "")
                .then(function (dataStr) {
                    let data = JSON.parse(dataStr);

                    that.showProducts(data, senderId);

                });

        }
    }

    /*---------------Private method------------------*/

    /**
     * 
     * @param {[]} products 
     * @param {*} senderId 
     */
    showProducts(products, senderId) {
        console.log('STANDING AT SHOW PRODUCTS')
        console.log(products)
        var elements = [];
        var condition = products.length
        if (condition <= 4) {
            for (var i = 0; i < condition; i++) {
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
                            payload: "Đặt $" + products[i].ProductID + " $" + products[i].ProductName + " $" + products[i].Price + " $" + products[i].PicURL + " $" + products[i].ProductCode
                        }
                    ]
                }
                elements.push(element);
            }
        } else {
            condition = 4
            for (var i = 0; i < condition; i++) {
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
                            payload: "Đặt $" + products[i].ProductID + " $" + products[i].ProductName + " $" + products[i].Price + " $" + products[i].PicURL + " $" + products[i].ProductCode
                        }
                    ]
                }
                elements.push(element);
            }
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