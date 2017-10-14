

var order = require('./entities/order');
var response = require('./entities/response');
let Dialog = require('./dialog');
let Pattern = require('./entities/pattern');
let ClassParser = require('../utils/class-parser');
let Request = require('../utils/request');

class OrderDialog extends Dialog {
    constructor () {
        super();
        this.orders = [];
        this.tmpOrder = new order.Order();
        this.push();
    }
    
    push() {
        
        this.addPatterns(["DaiTu", "YeuCau", "DatHang"], 1);
        this.addPatterns(["DaiTu", "YeuCau", "Number", "DonVi"], 2);
        this.addPatterns(["End"], 3);

        this.patterns.push(new Pattern.Pattern("ok", 4));

    }

    continue(input, senderId){
        var result;
        switch(this.step){
            case 1: result = this.askForProduct(senderId); break;
            case 2: result = this.orderProduct(input, senderId); break;
            case 3: result = this.finishOrder(senderId); break;
            case 4: result = this.end(senderId); break;
            default: break;
        }
        return result;
    }
    
    askForProduct(senderId){
        this.step = 2;
        this.reply(senderId, {'text' : 'Bạn muốn gọi món gì'});
    }

    orderProduct(input, senderId) {
        var result = null;
        var s = "";
        var that = this;
        if (input != null) {
            var orderQuantity = input.match(/\d+/g)[0];
            this.sendTyping(senderId);

            var orderedProduct = input.substring(that.posToAnalyze, input.length);

            s = "Bạn muốn gọi thêm món gì không?";
            new Request().sendGetRequest('/LBFC/Store/GetProductInStoreByName', {'storeId' : '36', 'name': orderedProduct}, "")
            .then(function(data) { 
                console.log("data == " + data);
                if (data.length == 0) {
                    s = "Quán không có bán món đó ạ";
                } else {
                    result = data; 
                    console.log(result); 
                    that.orders.push(new order.Order(orderedProduct, orderQuantity));
                }
                that.reply(senderId, {'text' : s});
                
            });
            

        } else {
            s = "Bạn muốn gọi thêm món gì không?";
            this.reply(senderId, {'text' : s});
        }

        
    }

    finishOrder(senderId) {
        var s = "";
        s += "Để mình lặp lại order: \n";
        this.orders.forEach(function(order) {
            s += "Sản phẩm : " + order.productId + ", sl = " + order.quantity + "\n";
        }, this);
        this.reply(senderId, {'text' : s});
        
    }

    end (senderId) {
        this.orders = [];
        super.end(senderId);
    }

    getName() {
        return "order dialog";
    }
    
}

module.exports = {
    OrderDialog : OrderDialog
}