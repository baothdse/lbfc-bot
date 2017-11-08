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
            case 4.1: this.receiveConfirmFindMore(input, senderId); break;
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
        if (!that.session.findingProduct) {
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
        let listKeywordMatching = [];
        let that = this;
        let keyword;
        for (let i = 0, condition = keywords.length; i < condition; i++) {
            keyword = {
                keyword: keywords[i],
                ed: this.levenshteinDistance(input, keywords[i])
            }
            if (keyword.ed <= 2) {
                listKeywordMatching.push(keyword)
            }
        }
        this.bubbleSort(listKeywordMatching)
        console.log(listKeywordMatching)
        if (listKeywordMatching[0].ed == 0) {
            that.step = 4;
            that.session.findingProduct = listKeywordMatching[0].keyword
            that.continue('ok', senderId);
        } else {
            if (listKeywordMatching.length == 1) {
                that.step = 3
                reply = listKeywordMatching[0].keyword
                that.sendTextMessage(senderId, "Ý của bạn muốn tìm " + reply + ' phải không?')
                that.session.findingProduct = listKeywordMatching[0].keyword
            } else if (listKeywordMatching.length > 1) {
                for (var i = 0, condition = listKeywordMatching.length; i < condition; i++) {
                    reply += "- " + listKeywordMatching[i].keyword + " \n";
                }
                console.log(reply)
                that.step = 2;
                that.sendTextMessage(senderId, "Ý của bạn là: \n" + reply)
            }
        }
        // if (listProductMatching.length == 1) {
        //     this.step = 3
        //     reply = listProductMatching[0]
        //     this.sendTextMessage(senderId, "Ý của bạn muốn tìm " + reply + ' phải không?')
        //     this.session.findingProduct = listProductMatching[0]
        // } else if (listProductMatching.length > 1) {
        //     for (var i = 0, condition = listProductMatching.length; i < condition; i++) {
        //         reply += "- " + listProductMatching[i] + " \n";
        //     }
        //     this.sendTextMessage(senderId, "Ý của bạn là sản phẩm nào:" + reply)
        // }
    }
    confirmEditKeyword(input, senderId) {
        this.step = 4;
        this.continue(input, senderId);
    }

    // receiveEditKeywords(input, senderId) {
    //     this.step = 5;

    // }
    /**
     * Step 4: 
     * @param {*} input 
     * @param {*} senderId 
     */
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
                console.log(listProduct)
                if (listProduct.length == 0) {
                    that.step = 4.1;
                    that.sendTextMessage(senderId, "Cửa hàng chúng tôi không có món nào với từ khóa " + this.session.findingProduct + " cả") 
                    that.sendTextMessage(senderId, "Bạn có muốn tìm tiếp không?")
                } else if (listProduct.length < 4) {
                    let top4Product = [];
                    for (let i = 0, condition = listProduct.length; i < condition; i++) {
                        let subtitle = listProduct[i].Product.ProductName + " \n " + listProduct[i].Product.Price + "VND"
                        let element = {
                            title: listProduct[i].Name,
                            image_url: listProduct[i].Product.PicURL,
                            subtitle: subtitle,
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
                } else if (listProduct.length > 4) {
                    let top4Product = [];
                    for (let i = 0; i < 4; i++) {
                        let subtitle = listProduct[i].Product.ProductName + " \n " + listProduct[i].Product.Price + "VND"
                        let element = {
                            title: listProduct[i].Name,
                            image_url: listProduct[i].Product.PicURL,
                            subtitle: subtitle,
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

    receiveConfirmFindMore(input, senderId) {
        let that = this;
        if(input.match(/(có|yes|tiếp|tìm)/i)) {
            that.step = 1
            delete that.session.findingProduct;
            that.continue(input, senderId);
        } else if(input.match(/(ko|không|thôi|khỏi)/i)) {
            that.step = 5;
            delete that.session.findingProduct;
            that.continue(input, senderId)
        }
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
        // console.log(a)
        // console.log(b)
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
        // console.log(d[length2][length1])
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