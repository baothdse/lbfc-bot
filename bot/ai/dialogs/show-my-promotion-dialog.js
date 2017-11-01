let Dialog = require('./dialog');
let ShowMyPromotionIntent = require('../intents/promotions/show-my-promotion-intent');

class ShowMyPromotionDialog extends Dialog{

    constructor(){
        super();
        this.push();
    }

    push() {
        this.addIntent(new ShowMyPromotionIntent(1, 0));
    }

    pause() {
        --this.step;
    }

    continue(input, senderId) {
        switch (this.step) {
            case 1:
                this.showPromotion(senderId);
                break;
            default:
                this.end();
                break;
        }
    }


    /**
     * Step 1: Hiện promotion của store ra
     * @param {int} senderId 
     */
    showPromotion(senderId) {
        var that = this;
        this.step = 2;
        var request = new MyRequest();
        request.sendGetRequest('/LBFC/Store/GetStorePromotions', {'storeId' : 36}, '')
        .then(function (data) {
            var promotions = JSON.parse(data);
            console.log('show-promotion-dialog.js:42 -----> ');
            console.log(promotions);
            that.reply(senderId, new PromotionListTemplate(promotions).template);
            
        });
    }


    /*---------------------------------Exception----------------------------- */
    
    /**
     * Xử lý khi user áp dụng một promotion
     * @param {string} input 
     * @param {int} senderId 
     */
    applyPromotion(input, senderId) {
        var promotionIdPos = input.match(/$/i).index;
        var promotionId = input.substring(promotionIdPos + 1, input.length);

        
    }

    getName() {
        return 'show promotion dialog';
    }
}

module.exports = ShowMyPromotionDialog