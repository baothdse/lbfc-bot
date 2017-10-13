"use strict";

var converter = require('../vietnamese/vietnamese-converter');


var orderDialog = require('./dialogs/order-dialog');
var HelpDiaglog = require('./dialogs/help-dialog');

var Response = require('./dialogs/entities/response');

var fbApi = require('../api/facebookApi')



class Brain {

    constructor() {
        this.dialogStack = [];
        this.dialogs = [new orderDialog.OrderDialog(), new HelpDiaglog.HelpDialog()];
        this.vietnameseConverter = new converter.VietNameseConverter();

    }

    response(senderId, input) {
        //input = this.vietnameseConverter.convert(input);
        var response = new Response.Response("Tôi không hiểu", false);
        var that = this;
        this.dialogs.some(function (dialog) {
            //Kiếm coi có dialog nào có pattern giống với user vừa nhập ko
            if (dialog.isMatch(input)) {
                if (!that.isInStack(dialog)) {
                    that.dialogStack.push(dialog);
                }
                response = dialog.continue();
                //nếu dialog này xong rồi thì pop nó ra khỏi stack
                if (dialog.status == "end") {
                    var d = that.removeDialog(dialog);
                    console.log("d == null? " + (d == null));
                    if (d != null) {
                        response.message+= "\n" + d.continue().message;
                    }
                }
                return true;
            }
        }, this);
        fbApi.sendTextMessage(senderId, response.message)
    }

    isInStack(dialog) {
        var result = false;
        this.dialogStack.some(function (d) {
            if (d.getName() == dialog.getName()) {
                result = true;
                return true;
            }
        }, this);
        return result;
    }

    removeDialog(dialog) {
        var result = null;
        for (var i = 0; i < this.dialogStack.length; i++) {
            var element = this.dialogStack[i];
            if (element.getName() == dialog.getName()) {
                this.dialogStack.splice(i, 1);
                result = this.dialogStack[i - 1];
                break;
            }
        }
        return result;
    }
}


module.exports = {
    Brain: Brain
}