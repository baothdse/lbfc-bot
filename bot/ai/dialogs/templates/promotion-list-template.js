class PromotionListTemplate {
    constructor(promotions) {
        var elements = this.toJson(promotions);
        this.template = {
            'attachment' : {
                'type' : 'template',
                'payload': {
                    'template_type': 'generic',
                    'elements' : elements,
                }
            }
        }
    }

    toJson(promotions) {
        var elements = [];
        promotions.forEach(function(promotion) {
            var fromDate = new Date(parseInt(promotion.FromDate.substring(6, promotion.FromDate.length - 2)));
            var toDate = new Date(parseInt(promotion.ToDate.substring(6, promotion.ToDate.length - 2)));
            elements.push(
                {
                    'title' : promotion.PromotionName,
                    'subtitle' : promotion.Description + '\n' + 'Từ ' + 
                    fromDate.getDate() + '/' + (fromDate.getMonth() + 1) + '/' + fromDate.getFullYear()
                    + ' đến ' +
                    toDate.getDate() + '/' + (toDate.getMonth() + 1) + '/' + toDate.getFullYear(),
                    'image_url' : promotion.ImageURL,
                    'buttons' : [
                        {
                            'title' : 'Áp dụng ' + promotion.PromotionName,
                            'type' : 'postback',
                            'payload' : 'Áp dụng $' + promotion.PromotionId,
                        }
                    ]
                }
            );
        }, this);
        return elements;
    }
}

module.exports = PromotionListTemplate