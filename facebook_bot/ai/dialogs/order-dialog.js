"use strict";

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
        // this.patterns.push(new Pattern.Pattern("tôi muốn đặt hàng", 1));
        // this.patterns.push(new Pattern.Pattern("tôi muốn mua \\d+ ly cà phê", 2));
        // this.patterns.push(new Pattern.Pattern("tôi muốn mua \\d+ ly trà sữa", 2));
        // this.patterns.push(new Pattern.Pattern("hết rồi", 3));
        // this.patterns.push(new Pattern.Pattern("ok", 4));

        var parser = new ClassParser.ClassParser(["DaiTu", "YeuCau", "DatHang"]);
        var patternParsed = parser.parse();
        var that = this;
        patternParsed.forEach(function(p) {
            that.patterns.push(new Pattern.Pattern(p, 1));
        }, this);

        parser = new ClassParser.ClassParser(["DaiTu", "YeuCau", "Number", "DonVi"]);
        var patternParsed = parser.parse();
        var that = this;
        patternParsed.forEach(function(p) {
            that.patterns.push(new Pattern.Pattern(p, 2));
        }, this);

        parser = new ClassParser.ClassParser(["End"]);
        var patternParsed = parser.parse();
        var that = this;
        patternParsed.forEach(function(p) {
            that.patterns.push(new Pattern.Pattern(p, 3));
        }, this);

    }

    continue(){
        var result;
        switch(this.step){
            case 1: result = this.askForProduct(); break;
            case 2: result = this.orderProduct(); break;
            case 3: result = this.finishOrder(); break;
            case 4: result = this.end(); break;
            default: break;
        }
        return result;
    }
    
    askForProduct(){
        this.step = 2;
        return new response.Response("Bạn muốn gọi món gì?", true);
    }

    orderProduct() {
        var request = new Request();
        var result = null;
        var that = this;
        var s = "Bạn muốn gọi thêm gì?";
        await request.sendGetRequestAsync('/LBFC/Store/SearchProductByStoreId', {'storeId' : '36', 'keyword': ''}, "");
        that.orders.push(new order.Order(1, 2));
        return new response.Response(s, true);
        
    }

    finishOrder() {
        var s = "";
        s += "Để mình lặp lại order: \n";
        this.orders.forEach(function(order) {
            s += "Sản phẩm : " + order.productId + ", sl = " + order.quantity + "\n";
        }, this);
        return new response.Response(s, false);
        
    }

    getName() {
        return "order dialog";
    }
    
}

module.exports = {
    OrderDialog : OrderDialog
}