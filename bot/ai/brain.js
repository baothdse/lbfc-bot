

var converter = require('../vietnamese/vietnamese-converter');


var orderDialog = require('./dialogs/order-dialog');
var HelpDiaglog = require('./dialogs/help-dialog');
let ShowMenuDialog = require('./dialogs/show-menu-dialog');

var Response = require('./dialogs/entities/response');
let Dialog = require('./dialogs/dialog');


class Brain {

    constructor() {
        this.dialogStack = [];
        this.dialogs = [new orderDialog.OrderDialog(), new HelpDiaglog.HelpDialog(), new ShowMenuDialog()];
        this.vietnameseConverter = new converter.VietNameseConverter();

    }

    receive(req, res) {
        if (req.body.object === 'page') {
            req.body.entry.forEach(entry => {
                entry.messaging.forEach(event => {
                    if (event.message && event.message.text) {
                        this.response(event);
                        
                    }
                });
            });
    
            res.status(200).end();
        }
    };

    response(event) {
        var that = this;

        const senderId = event.sender.id;

        var currentDialog = this.dialogStack[this.dialogStack.length];

        if (currentDialog == null || !currentDialog.isMatch(event.message.text)) {
            this.dialogs.some(function (dialog) {
                if (dialog.isMatch(event.message.text)) {
                    if (!that.isInStack(dialog)) {
                        that.dialogStack.push(dialog);
                    }
                    dialog.continue(event.message.text, senderId);

                    if (dialog.status == "end") {
                        var d = that.removeDialog(dialog);
                        if (d != null) {
                            d.continue(null, senderId);
                        }
                    }
                }
            });

        } else {
            currentDialog.continue(event.message.text, senderId);
        }
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

    isInStack(dialog) {
        var result = false;
        this.dialogStack.some(function(d){
            if (d.getName() == dialog.getName()){
                result = true;
                return true;
            }
        }); 
        return result;
    }
}



module.exports = Brain