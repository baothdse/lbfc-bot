let Dialog = require('./dialog');
let ClassParser = require('../utils/class-parser');
var Request = require('../utils/request');
let async = require("asyncawait/async");
let await = require("asyncawait/await");

/*-------------------Intent---------------------*/
let SearchProductIntent = require('../intents/products/search-product-intent');
let SearchProductFilterIntent = require('../intents/products/search-product-filter-intent');
let ProductPriceFilterIntent = require('../intents/products/product-price-filter-intent');
//let SearchPriceIntent = require('../intents/search/search-price-intent')
/*-----------------End intent------------------*/

class SearchDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new SearchProductIntent(1, 0));
        // this.addIntent(new SearchProductFilterIntent(2, 0));
        // //this.addIntent(new ProductPriceFilterIntent(3.2, 0));
        // this.addIntent(new SearchPriceIntent(3.2, 0))
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1:
                this.askSearchOption(input, senderId);
                break;
            case 2:
                this.end(); break;
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

    getName() {
        return "search dialog";
    }
}

module.exports = SearchDialog;