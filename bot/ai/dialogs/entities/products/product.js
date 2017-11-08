let ConsoleLog = require('../../../utils/console-log');

class Product {

    /**
     * 
     * @param {{ProductID, ProductName, Price, PicURL, DiscountPrice, ProductCode}} data 
     */
    constructor(data) {
        this.productID = data.ProductID;
        this.productName = data.ProductName;
        this.price = data.Price;
        this.picURL = data.PicURL;
        this.discountPrice = data.DiscountPrice;
        this.productCode = data.ProductCode;

        this.quantity = 0;
    }

    clone() {
        var that = this;
        var product = new Product({
            ProductID: that.productID, 
            ProductName: that.productName,
            Price: that.price, 
            PicURL: that.picURL, 
            DiscountPrice: that.discountPrice,
            ProductCode: that.productCode,
        });
        product.quantity = this.quantity;
        return product;
    }

    simplify() {
        return {
            productID: this.productID,
            productName: this.productName,
            price: this.price,
            picURL: this.picURL,
            discountPrice: this.discountPrice,
            quantity: this.quantity,
            productCode: this.productCode,
        };
    }
}

module.exports = Product