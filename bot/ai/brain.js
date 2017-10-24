let async = require("asyncawait/async");
let await = require("asyncawait/await");

var converter = require('../vietnamese/vietnamese-converter');


var OrderDialog = require('./dialogs/order-dialog');
var HelpDialog = require('./dialogs/help-dialog');
var HelloDialog = require('./dialogs/hello-dialog');
let ShowMenuDialog = require('./dialogs/show-menu-dialog');
let SearchDialog = require('./dialogs/search-dialog');
let BrandDialog = require('./dialogs/brand-dialog')

var Response = require('./dialogs/entities/response');
let Dialog = require('./dialogs/dialog');


class Brain {

    constructor() {
        this.usingDialog = [];
        this.freeDialogs = [new HelloDialog(), new OrderDialog(), new HelpDialog(),
             new ShowMenuDialog(), new SearchDialog(), new BrandDialog()];
        this.vietnameseConverter = new converter.VietNameseConverter();

    }

    receive(req, res) {
        if (req.body.object === 'page') {
            req.body.entry.forEach(entry => {
                entry.messaging.forEach(event => {
                    //if user send messages
                    if (event.message) {
                        if (event.message.text) {
                            this.response(event, 'message');
                        }
                        else if (event.message.quick_reply) {
                            this.response(event, 'quickReply')
                        }
                    }
                    // if user click button 
                    else if (event.postback) {
                        var payload = event.postback.payload;
                        this.response(event, "payload");
                    }
                });
            });
            res.status(200).end();
        }
    };

    response(event, type) {
        console.log("brain ==================== 53")
        console.log(event)
        async(() => {
            var message = "";
            switch (type) {
                case "message": 
                    message = {
                        "message": event.message.text,
                        "type" : "text"
                    }
                    // console.log("brain ==================== 60")
                    // console.log(event.message.text)
                    break;
                case "payload":
                    // console.log("brain ==================== 64")
                    // console.log(event.postback.payload)
                    message = {
                        "message": event.postback.payload,
                        "type" : "payload"
                    }
                    break;
                case "quickReply":
                    // console.log("brain ==================== 69")
                    // console.log(event.message.quick_reply.payload)
                    message = {
                        "message": event.message.quick_reply.payload,
                        "type" : "quickReply"
                    }
                    break;
            }
            var that = this;

            const senderId = event.sender.id;
            var currentDialog = this.usingDialog[this.usingDialog.length - 1];
            var beginNewDialog = false;
            this.freeDialogs.some(function (dialog) {
                var match = dialog.isMatch(message.message);
                if (match) {
                    if (!that.isInStack(dialog)) {
                        that.usingDialog.push(dialog);
                        that.removeFromFreeList(dialog);
                        if (currentDialog != null) currentDialog.pause();
                    }
                    dialog.continue(message, senderId);

                    if (dialog.status == "end") {
                        console.log("END DIALOG")
                        var d = that.removeFromUsingList(dialog);
                        that.freeDialogs.push(dialog);
                        if (d != null) {
                            d.continue(null, senderId);
                        }
                        dialog.reset();
                    }
                    beginNewDialog = true;
                    return true;
                }
            });

            if (!beginNewDialog && currentDialog != null) {
                currentDialog.isMatch(message.message);
                currentDialog.continue(message, senderId);
                console.log('brain.js: 105 ---->' + currentDialog.status);
                if (currentDialog.status == "end") {
                    var d = that.removeFromUsingList(currentDialog);
                    that.freeDialogs.push(currentDialog);
                    if (d != null) {
                        d.continue(null, senderId);
                    }
                    currentDialog.reset();
                }

            }
        })();
    }

    /**
     * Xóa dialog khỏi stack các dialog đang sử dụng
     * @param {Dialog} dialog Dialog muốn xóa
     */
    removeFromUsingList(dialog) {
        var result = null;
        for (var i = 0; i < this.usingDialog.length; i++) {
            var element = this.usingDialog[i];
            if (element.getName() == dialog.getName()) {
                this.usingDialog.splice(i, 1);
                result = this.usingDialog[i - 1];
                break;
            }
        }
        return result;
    }

    isInStack(dialog) {
        var result = false;
        this.usingDialog.some(function (d) {
            if (d.getName() == dialog.getName()) {
                result = true;
                return true;
            }
        });
        return result;
    }


    /**
     * Xóa khỏi danh sách dialog hiện tại
     * @param {Dialog} dialog Dialog muốn xóa
     */
    removeFromFreeList(dialog) {
        for (var i = 0; i < this.freeDialogs.length; i++) {
            var element = this.freeDialogs[i];
            if (element.getName() == dialog.getName()) {
                this.freeDialogs.splice(i, 1);
                break;
            }
        }
    }
}
module.exports = Brain