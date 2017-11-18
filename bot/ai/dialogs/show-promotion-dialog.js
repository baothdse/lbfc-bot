let Dialog = require('./dialog');
let Pattern = require('../intents/patterns/pattern');
let PromotionListTemplate = require('./templates/promotion-list-template');
let Request = require('../utils/request');
const ShowPromotionIntent = require('../intents/promotions/show-promotion-intent');
const ConsoleLog = require('../utils/console-log');

class ShowPromotionDialog extends Dialog{

    constructor(session){
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new ShowPromotionIntent(1, 0));
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
        var request = new Request();
        request.sendGetRequest('/LBFC/Promotion/GetBrandPromotion', {'brandId' : this.session.brandId}, '')
        .then((response) => {
            let promotions = JSON.parse(response);
            let elements = [];
            promotions.forEach(promotion => {
                let element = {
                    title: promotion.PromotionName,
                    image_url: promotion.ImageURL,
                    subtitle: promotion.Description,
                    default_action: {
                        "type": "web_url",
                        "url": "https://www.facebook.com/permalink.php?story_fbid=143435499716864&id=119378645455883",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall"
                    }
                }
                elements.push(element);
            });
            this.sendTextMessage(senderId, `Hiện tại thì bên em có một số chương trình khuyến mãi đây ${this.session.pronoun.toLowerCase()}`)
            .then((res) => {
                this.sendGenericMessage(senderId, elements);
            })
        })
        .catch((err) => {
            ConsoleLog.log(err, this.getName(), 68);
        })
        this.step = 2;
        this.continue('', '');
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


    /*--------------------Private methods-----------------------*/



    getName() {
        return 'show promotion dialog';
    }
}

module.exports = ShowPromotionDialog