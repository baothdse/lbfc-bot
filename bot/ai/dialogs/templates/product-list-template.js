
class ProductListTemplate {
    constructor(products){

        var elements = this.productsToJson(products);

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

    productsToJson(products) {
        var elements = [];
        products.forEach(function(product) {
            elements.push(
                {
                    'title' : product.ProductName,
                    'subtitle' : 'Giá: ' + product.Price,
                    'image_url' : product.PicURL,
                    'buttons' : [
                        {
                            'title' : 'Đặt hàng',
                            'type' : 'postback',
                            'payload' : 'Đặt ' + product.ProductName,
                        }
                    ]
                }
            );
        }, this);
        return elements;
    }
}

module.exports = ProductListTemplate