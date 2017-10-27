let VietnameseConverter = require('../vietnamese/vietnamese-converter');

let OrderDialog = require('./dialogs/order-dialog');
let HelpDiaglog = require('./dialogs/help-dialog');
let ShowMenuDialog = require('./dialogs/show-menu-dialog');
let ShowPromotionDialog = require('./dialogs/show-promotion-dialog');
let SearchDialog = require('./dialogs/search-dialog');
let HelloDialog = require('./dialogs/hello-dialog');
let Dialog = require('./dialogs/dialog');

let ConsoleLog = require('./utils/console-log');

let async = require('asyncawait/async')
let await = require('asyncawait/await')


class Brain {

    constructor() {
        this.usingDialog = [];
        this.freeDialogs = [new OrderDialog(), new ShowMenuDialog(), new ShowPromotionDialog(), new SearchDialog()
            , new HelloDialog()];
        this.vietnameseConverter = new VietnameseConverter();
        this.session = []
    }

    receive(req, res) {
        if (req.body.object === 'page') {
            req.body.entry.forEach(entry => {
                entry.messaging.forEach(event => {

                    if (event.message && event.message.text) {
                        this.response(event, 'message');
                    }
                    else if (event.message && event.message.quick_reply) {
                        this.response(event, 'quick_reply');
                    } else if (event.message && event.message.attachments) {
                        this.response(event, 'attachments');
                    }
                    else if (event.postback && event.postback.payload) {
                        this.response(event, 'postback');
                    }
                });
            });

            res.status(200).end();
        }
    };

    /**
     * Nhận event từ Facebook và tìm kiếm các dialog mà chạy
     * @param {Facebook event} event Nhận event từ Facebook
     * @param {boolean} type Event này là message hay postback hay quick_reply
     */
    response(event, type) {
        async(() => {
            var message = '';
            switch (type) {
                // case 'message': message = this.vietnameseConverter.convert(event.message.text); break;
                case 'message': message = event.message.text; break;
                case 'postback': message = event.postback.payload; break;
                case 'attachments': message = event.message.attachments; break;
                default: message = event.message.quick_reply.payload; break;
            }
            console.log(message)
            var that = this;
            const senderId = event.sender.id;
            var currentDialog = this.usingDialog[this.usingDialog.length - 1];

            var beginNewDialog = false;
            this.freeDialogs.some(function (dialog) {
                var match = dialog.isMatch(message, senderId);
                if (match == true) {
                    if (!that.isInStack(dialog)) {
                        that.usingDialog.push(dialog);
                        that.removeFromFreeList(dialog);
                        if (currentDialog != null) currentDialog.pause();
                    }
                    if (dialog.status == "end") {
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
                ConsoleLog.log('continue dialog', 'brain.js', 87);
                var isMatch = currentDialog.isMatch(message, senderId);
                if (!isMatch) {
                    currentDialog.continue(message, senderId);
                }
                if (currentDialog.status == "end") {
                    var d = that.removeFromUsingList(currentDialog);
                    that.freeDialogs.push(currentDialog);
                    if (d != null) {
                        d.continue(null, senderId);
                    }
                    currentDialog.reset();
                }

            }
        })()
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
     * Trả về dialog trong stack trùng tên với dialogName. Trả về null nếu ko có kết quả
     * @param {string} dialogName Tên của dialog muốn kiếm
     */
    getInStack(dialogName) {
        var result = false;
        this.usingDialog.some(function (d) {
            if (d.getName() == dialogName) {
                result = d;
                return true;
            }
        });
        return d;
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