
class Order {
    constructor(productId, productName, price, quantity, productUrl, brandId) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.productUrl = productUrl;
        this.brandId = brandId;
    }
}

module.exports = Order;