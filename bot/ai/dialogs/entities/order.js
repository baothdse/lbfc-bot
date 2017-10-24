
class Order {
    constructor(productId, productName, price, quantity, orderType, productUrl) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.orderType = orderType;
        this.productUrl = productUrl
    }
}

module.exports = Order;