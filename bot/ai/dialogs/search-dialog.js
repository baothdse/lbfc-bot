let Dialog = require('./dialog');
let ClassParser = require('../utils/class-parser');
var Request = require('../utils/request');
let async = require("asyncawait/async");
let await = require("asyncawait/await");

/*-------------------Intent---------------------*/
let SearchProductIntent = require('../intents/products/search-product-intent');
let SearchProductFilterIntent = require('../intents/products/search-product-filter-intent');
let ProductPriceFilterIntent = require('../intents/products/product-price-filter-intent');
let SearchPriceIntent = require('../intents/search/search-price-intent')
/*-----------------End intent------------------*/

class SearchDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new SearchProductIntent(1, 0));
        this.addIntent(new SearchProductFilterIntent(2, 0));
        //this.addIntent(new ProductPriceFilterIntent(3.2, 0));
        this.addIntent(new SearchPriceIntent(3.2, 0))
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1:
                this.askSearchOption(input, senderId);
                break;
            case 2:
                this.askProductName(input, senderId);
                break;
            case 3.1:
                this.showProductByName(input, senderId);
                break;
            case 3.2:
                this.showProductByPriceRange(input, senderId, info);
            default: break;
        }
    }

    /**
     * Step 1
     * @param {*} input 
     * @param {*} senderId 
     */
    askSearchOption(input, senderId) {
        this.step = 2;
        this.sendQuickReply(senderId, "Bạn muốn tìm theo tên sản phẩm hay giá tiền?",
            [{
                content_type: "text",
                title: "Tên sản phẩm",
                payload: "Tên sản phẩm",
                image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHaUQeknhzv-GWnDtd-Hh4t2qk_q62PZSXPPornzs1ebVOfgxV"
            }, {
                content_type: "text",
                title: "Giá tiền",
                payload: "Giá tiền",
                image_url: "https://image.flaticon.com/icons/png/128/189/189093.png"
            }])
        this.continue(input, senderId);
    }

    askProductName(input, senderId) {
        var message = input.toLowerCase();

        if (message == "tên sản phẩm" || message == "tên") {
            this.step = 3.1;
            this.reply(senderId, { "text": "Bạn vui lòng cho mình biết tên sản phẩm cần tìm?" });
        } else if (message == "giá tiền" || message == "giá") {
            this.step = 3.2;
            this.reply(senderId, { "text": "Bạn muốn tìm sản phẩm trong tầm giá bao nhiêu?" });
        }
    }

    showProductByName(input, senderId) {
        var listProduct = null;
        var output = '';
        var that = this;
        if (input != null) {
            this.sendTyping(senderId);
            new Request().sendGetRequest('/LBFC/Product/GetBrandHasProduct', { 'keyword': input }, "")
                .then(function (data) {
                    if (data.length == 0) {
                        output = "Hệ thống không có món đó";
                    } else {
                        listProduct = JSON.parse(data);
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

                });
        }

    }

    showProductByPriceRange(input, senderId, info) {
        console.log("ĐANG SEARCH PRODUCT THEO PRICE")
        console.log(info)
        this.step = 4;
        let that = this;
        let top4Product = [];
        if(info != null) {
            let condition = info.listProduct.length;
            if (info.listProduct.length > 4) {
                condition = 4
            }
            for (let i = 0; i < condition; i++) {
                let element = {
                    title: info.listProduct[i].Product.ProductName,
                    image_url: info.listProduct[i].Product.PicURL,
                    subtitle: "Sản phẩm này được làm từ ... \n" + info.listProduct[i].Product.Price + "VND",
                    default_action: {
                        "type": "web_url",
                        "url": "https://pinterest.com",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall"
                    },
                    buttons: [
                        {
                            type: "postback",
                            title: "Đặt sản phẩm",
                            payload: "Đặt $" + info.listProduct[i].Product.ProductID + " $" + info.listProduct[i].Product.ProductName + " $" + info.listProduct[i].Product.Price + " $" + info.listProduct[i].Product.PicURL + " $" + info.listProduct[i].Id,
                        }
                    ]
                }
                top4Product.push(element);
            }
            that.sendGenericMessage(senderId, top4Product)
        }
    }

    getName() {
        return "search dialog";
    }
}

module.exports = SearchDialog;