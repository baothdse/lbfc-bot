
class ProductTemplate {

    constructor(text, imageUrl, price) {
        this.template = {
            
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": text,
                            "image_url": imageUrl,
                            "subtitle": "Giá: " + price,
                            "buttons" : [
                                {
                                    'type': 'postback',
                                    'title': 'Đặt hàng',
                                    'payload': 'Đặt ' + text,
                                }
                            ]
                            
                        }
                    ],
                }
            }
        }
    }

    getJson() {
        return this.template;

    }

}

module.exports = ProductTemplate