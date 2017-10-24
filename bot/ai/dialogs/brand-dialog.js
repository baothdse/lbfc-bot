"use strict";
let Dialog = require('./dialog');
let Pattern = require('./entities/pattern');
let await = require('asyncawait/await')

class BrandDialog extends Dialog {
    constructor() {
        super();
        this.push();
    }

    push() {
        this.patterns.push(new Pattern("Nhãn hiệu", 1));
    }

    continue(input, senderId) {
        console.log("In Brand-Dialog")
        switch (this.step) {
            case 1: this.askBrandName(senderId); break;
            case 2: this.showBrandDetail(input.message, senderId); break;
            case 3: this.showPromotionsOfBrand(input.message, senderId); break;
            case 4.1: this.getCodeByBrand(input.message, senderId); break;
        }
    }

    askBrandName(senderId) {
        console.log("brand dialog ==============24")
        this.step = 2;
        this.reply(senderId, { 'text': 'Hiện có 50 nhãn hiệu trong hệ thống của chúng tôi gồm có: ... Vui lòng nhập tên nhãn hiệu bạn quan tâm!' });
    }

    showBrandDetail(input, senderId) {
        console.log("brand dialog ==============30")
        var listBrand = [
            {
                "id": "1",
                "brandName": "Starbucks"
            },
            {
                "id": "2",
                "brandName": "Highlands"
            }
        ];
        var flag = 1;

        for (var index = 0; index < listBrand.length; index++) {
            if (listBrand[index].brandName == input) {
                this.step = 3;
                flag = 0;
                var sender = await(this.getSenderName(senderId));
                this.sendGenericMessage(senderId, [{
                    title: "Cám ơn " + sender.first_name + " đã chọn " + listBrand[index].brandName + " hôm nay! Chúng tôi có thể giúp gì cho bạn?",
                    image_url: "https://marketingai.admicro.vn/wp-content/uploads/2017/07/starbucks.jpg",
                    subtitle: "highlandscoffee.com.vn",
                    default_action: {
                        "type": "web_url",
                        "url": "https://foody.vn",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall"
                    },
                    buttons: [
                        {
                            type: "postback",
                            title: "Menu",
                            payload: "Menu of brand $" + listBrand[index].id
                        },
                        {
                            type: "postback",
                            title: "Khuyến mãi",
                            payload: "Promotion of brand $" + listBrand[index].id
                        }
                    ]
                }])
                return;
            }
        }
        if (flag == 1) {
            this.step = 2;
            this.reply(senderId, { "text": "Nhãn hiệu này không nằm trong hệ thống của chúng tôi. Vui lòng chọn một trong các nhãn hiệu khác." })
            this.reply(senderId, listBrand[0].brandName + "\n");
        }
    }

    showPromotionsOfBrand(input, senderId) {
        console.log("brand dialog ==============> 77")
        console.log(input)
        this.step = 4.1;
        var listPromotionByBrand = [];
        var that = this;
        var listPromotion = [
            {
                "id": "1",
                "promotionName": "Buy 1 get 1",
                "image": "https://www.pennypinchinmom.com/wp-content/uploads/2015/11/starbucks-bobo.jpg",
                "description": "Tặng 1 ly nước khi mua một ly nước bất kỳ",
                "brandId": "1"
            },
            {
                "id": "2",
                "promotionName": "Tặng bình giữ nhiệt",
                "image": "https://i.pinimg.com/564x/6f/6b/e4/6f6be41685ac59415216251f894a5f19.jpg",
                "description": "Tặng một bình giữ nhiệt khi thanh toán hóa đơn trên 100k",
                "brandId": "1"
            },
            {
                "id": "3",
                "promotionName": "Combo bánh mì và cà phê",
                "image": "https://img.jamja.vn/jamja-prod/gcs_full_57a7ed9a6e0b494d1ab25f5a-2016-08-08-022534.jpg",
                "description": "Combo bánh mì và cà phê với giá 39.000đ",
                "brandId": "2"
            }
        ];
        var newInput = input.split("$", "3")
        console.log("New input : " + newInput)
        for (var i = 0; i < listPromotion.length; i++) {
            if (newInput[1] == listPromotion[i].brandId) {
                var element = {
                    title: listPromotion[i].promotionName,
                    image_url: listPromotion[i].image,
                    subtitle: listPromotion[i].description,
                    default_action: {
                        "type": "web_url",
                        "url": "https://foody.vn",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall"
                    },
                    buttons: [
                        {
                            type: "postback",
                            title: "Lấy mã khuyến mãi",
                            payload: "Get Code"
                        }
                    ]
                }
                listPromotionByBrand.push(element)
            }
        }
        console.log(listPromotionByBrand)
        that.sendGenericMessage(senderId, listPromotionByBrand)
    }

    getCodeByBrand(input, senderId) {
        let promotionCode = this.generateRandomString();
        this.reply(senderId, { "text": "Mã khuyến mãi của bạn là: " + promotionCode })
    }

    getName() {
        return "Brand dialog";
    }

    generateRandomString() {
        let promotionCode = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 12; i++) {

            promotionCode += characters.charAt(Math.floor(Math.random() * characters.length))
            if (promotionCode.length == 4) {
                promotionCode = promotionCode.concat("-")
            } else if (promotionCode.length > 4) {
                if ((promotionCode.split("", 12).length % 4) == 1) {
                    // console.log("brand dialog =================== 166")
                    // console.log(promotionCode.split(""))
                    promotionCode = promotionCode.concat("-")
                }
            }
        }
        //console.log(promotionCode.split("-"))
        return promotionCode;
    }

}
module.exports = BrandDialog;