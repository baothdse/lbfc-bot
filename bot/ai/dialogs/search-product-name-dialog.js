let Dialog = require('./dialog');
let SearchProductByNameIntent = require('../intents/products/search-product-by-name-intent');
let Request = require('../utils/request');
var await = require('asyncawait/await')

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
        switch (this.step) {
            case 0: this.continueException(input, step, info); break;
            case 1: this.askForProductName(input, senderId); break;
            case 2: this.receiveProductName(input, senderId); break;
            case 3: this.confirmEditKeyword(input, senderId); break;
            case 4: this.showProductByName(input, senderId); break;
            case 5: this.end(); break;
            default: break;
        }
    }

    continueException(input, senderId, info = null) {
        switch (this.exception) {

        }
    }

    /**
     * Step 1
     * @param {} senderId 
     */
    askForProductName(input, senderId) {
        this.step = 2;
        let that = this
        if (!this.session.findingProduct) {
            that.sendTextMessage(senderId, "Bạn muốn tìm món gì?"); 
        } else {
            that.continue(input, senderId)
        }
    }

    /**
     * Step 2
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveProductName(input, senderId) {
        var keywords = ['cafe', 'coffee', 'matcha', 'tea', 'iced', 'olong', 'blended', 'hot', 'soda', 'pineaple', 'strawberry', 'nho', 'dâu', 'muffin', 'chocolate', 'chicken', 'mocha', 'expresso', 'mojito', 'trà sữa', 'kem', 'milk', 'sữa', 'cookie', 'cream', 'socola', 'sô cô la']
        let reply = ""
        let listProductMatching = [];

        for (let i = 0, condition = keywords.length; i < condition; i++) {
            if (this.levenshteinDistance(input, keywords[i]) <= 2) {
                listProductMatching.push(keywords[i])
            }
        }
        if (listProductMatching.length == 1) {
            this.step = 3
            reply = listProductMatching[0]
            this.sendTextMessage(senderId, "Ý của bạn muốn tìm " + reply + ' phải không?')
            this.session.findingProduct = listProductMatching[0]
        } else if (listProductMatching.length > 1) {
            for (var i = 0, condition = listProductMatching.length; i < condition; i++) {
                reply += "- " + listProductMatching[i] + "/n";
            }
            this.sendTextMessage(senderId, "Ý của bạn là sản phẩm nào:" + reply)
        }
    }
    confirmEditKeyword(input, senderId) {
        this.step = 4;
        this.continue(input, senderId);
    }
    showProductByName(input, senderId) {
        var that = this;
        if (input.match(/(đúng|ok|phải|nó đó|chuẩn|chính xác)/g)) {
            that.step = 5
            let listProduct = null;
            let output = '';
            if (input != null) {
                this.sendTyping(senderId);
                var data = await(new Request().sendGetRequest('/LBFC/Product/GetBrandHasProduct', { 'keyword': this.session.findingProduct }, ""))
                listProduct = JSON.parse(data);
                if (listProduct.length == 0) {
                    output = "Hệ thống không có món đó";
                } else {
                    listProduct = JSON.parse(data);
                    var top4Product = [];
                    for (var i = 0; i < 4; i++) {
                        var element = {
                            title: listProduct[i].Name,
                            image_url: listProduct[i].Product.PicURL,
                            subtitle: listProduct[i].Product.ProductName + "/n" + listProduct[i].Product.Price + "VND",
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
            }
        } else {
            that.sendTextMessage(senderId, "Nếu không phải " + that.session.findingProduct + " thì là gì nhỉ?")
            that.step = 1;
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

    end() {
        this.session.searchProductDialog = null;
        super.end();
    }

    getName() {
        return "search product name dialog";
    }
}

module.exports = SearchProductNameDialog