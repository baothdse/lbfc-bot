let Dialog = require('./dialog');
let Pattern = require('./entities/pattern');
let ClassParser = require('../utils/class-parser');
var Request = require('../utils/request');
let async = require("asyncawait/async");
let await = require("asyncawait/await");

class SearchDialog extends Dialog {
    constructor() {
        super();
        this.push();
    }

    push() {
        this.addPatterns(["DaiTu", "DongTu", "Tim"], 1, 0);
        this.addPatterns(["Tim"], 1, 0);
        this.patterns.push(new Pattern("Tìm sản phẩm", 1, 0));
        this.patterns.push(new Pattern("Tên sản phẩm", 2, 0));
        this.patterns.push(new Pattern("Giá tiền", 2, 0));
        this.patterns.push(new Pattern("Giá", 2, 0));
        this.patterns.push(new Pattern(["Adverb", "Number", "Abverd", "Number"], 3.2, 0));
        this.patterns.push(new Pattern(["Adverb", "Number"], 3.2, 0));
        this.patterns.push(new Pattern(["Number", "Number"], 3.2, 0));
    }

    continue(input, senderId) {
        console.log('In search dialog');
        console.log("Step")
        console.log(this.step)
        switch (this.step) {
            case 1:
                this.askSearchOption(input.message, senderId);
                break;
            case 2:
                this.askProductName(input.message, senderId);
                break;
            case 3.1:
                this.showProductByName(input.message, senderId);
                break;
            case 3.2:
                this.showProductByPriceRange(input.message, senderId);
            default: break;
        }
    }
    askSearchOption(input, senderId) {
        console.log('search.js ===========> 50')
        console.log(input)
        //this.reply(senderId, {"text" : "Bạn muốn tìm theo tên hay giá tiền?"});
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
    }

    askProductName(input, senderId) {        
        console.log('search-dialog 32 -----> input = ' + input);
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
        // console.log('ShowProductNAme')
        // console.log(input)
        var listProduct = null;
        var output = '';
        var that = this;
        if (input != null) {
            this.sendTyping(senderId);
            var data = await(new Request().sendGetRequest('/LBFC/Product/GetShopHasProductOutdoor', { 'keyword': input }, ""));
            // new Request().sendGetRequest('/LBFC/Product/GetShopHasProductOutdoor', { 'keyword': input }
            //     .then(function (data) {
            // console.log("82-------------------------")
            // console.log(data)
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
                                payload: "Đặt $" + listProduct[i].Product.ProductID + " $" + listProduct[i].Product.ProductName + " $" + listProduct[i].Product.Price + " $" + listProduct[i].Product.PicURL,
                            }
                        ]
                    }
                    top4Product.push(element);
                }
                that.sendGenericMessage(senderId, top4Product)
            }
            // }))
        }
        
    }

    showProductByPriceRange(input, senderId) {
        this.step = 4;
        var output = '';
        var listProduct = null;
        var that = this;
        if (input != null) {
            this.sendTyping(senderId);
            var data = await(new Request().sendGetRequest('/LBFC/Product/GetShopHasProductOutdoor', { 'keyword': input }, ""));
            
        }
    }

    getName() {
        return "search dialog";
    }
}

module.exports = SearchDialog;