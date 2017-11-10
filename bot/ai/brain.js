

var VietnameseConverter = require('../vietnamese/vietnamese-converter');


var OrderDialog = require('./dialogs/order-dialog');
var HelpDiaglog = require('./dialogs/help-dialog');
let ShowMenuDialog = require('./dialogs/show-menu-dialog');
let ShowPromotionDialog = require('./dialogs/show-promotion-dialog');
let HelloDialog = require('./dialogs/hello-dialog');
let ShowOrderHistoryDialog = require('./dialogs/show-order-history-dialog');
let ShowOrderDetailDialog = require('./dialogs/show-order-detail-dialog');
let SearchProductNameDialog = require('./dialogs/search-product-name-dialog');
let ShowStoreDialog = require('./dialogs/show-store-dialog');

var Response = require('./dialogs/entities/response');
let Dialog = require('./dialogs/dialog');

let ConsoleLog = require('./utils/console-log');


class Brain {

    constructor() {
        // this.usingDialog = [];
        // this.freeDialogs = [new OrderDialog(), new ShowMenuDialog(), new ShowPromotionDialog(), new SearchDialog()
        //     , new HelloDialog(), new ShowOrderHistoryDialog(), new ShowOrderDetailDialog()];

        this.vietnameseConverter = new VietnameseConverter();

        /**
         * @type {[{'senderId' : number, 'freeDialogs' : [], 'usingDialogs' : [], 'session': any}]}
         */
        this.senders = [];

    }

    receive(req, res) {
        if (req.body.object === 'page') {
            req.body.entry.forEach(entry => {
                entry.messaging.forEach(event => {
                    if (event.message && event.message.text && !event.message.quick_reply) {
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
        var message = '';
        switch (type) {
            // case 'message': message = this.vietnameseConverter.convert(event.message.text); break;
            case 'message': message = event.message.text; break;
            case 'postback': message = event.postback.payload; break;
            case 'attachments': message = event.message.attachments; break;
            default: message = event.message.quick_reply.payload; break;
        }

        const senderId = event.sender.id;
        this.insertSender(senderId);

        var usingDialogs = this.getUsingDialogs(senderId);
        var freeDialogs = this.getFreeDialogs(senderId);

        ConsoleLog.log('text = ' + message, 'brain.js', 59);
        var that = this;
        var currentDialog = usingDialogs[usingDialogs.length - 1];

        var beginNewDialog = false;
        freeDialogs.some(function (dialog) {
            var match = dialog.isMatch(message, senderId);
            if (match == true) {
                if (!that.isInStack(usingDialogs, dialog)) {
                    usingDialogs.push(dialog);
                    that.removeFromFreeList(freeDialogs, dialog);
                    if (currentDialog != null) currentDialog.pause();
                    beginNewDialog = true;
                }
                if (dialog.status == "end") {
                    var d = that.removeFromUsingList(usingDialogs, dialog);
                    freeDialogs.push(dialog);
                    if (d != null) {
                        currentDialog = d;
                    }
                    dialog.reset();
                    beginNewDialog = false;
                }
                return true;
            }
        });


        if (!beginNewDialog && currentDialog != null) {
            var isMatch = currentDialog.isMatch(message, senderId);
            if (!isMatch) {
                currentDialog.continue(message, senderId);
            }
            if (currentDialog.status == "end") {
                var d = that.removeFromUsingList(usingDialogs, currentDialog);
                freeDialogs.push(currentDialog);
                if (d != null) {
                    d.continue(null, senderId);
                }
                currentDialog.reset();
            }

        }

    }


    /**
     * Xóa dialog khỏi stack các dialog đang sử dụng
     * @param {Dialog} dialog Dialog muốn xóa
     */
    removeFromUsingList(usingDialogs, dialog) {
        var result = null;
        for (var i = 0; i < usingDialogs.length; i++) {
            var element = usingDialogs[i];
            if (element.getName() == dialog.getName()) {
                usingDialogs.splice(i, 1);
                result = usingDialogs[i - 1];
                break;
            }
        }
        return result;
    }

    /**
     * Kiểm tra xem có đang nằm trong các dialog đang dùng hay không
     * @param {*} dialog 
     */
    isInStack(usingDialogs, dialog) {
        var result = false;
        usingDialogs.some(function (d) {
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
    getInStack(usingDialogs, dialogName) {
        var result = false;
        usingDialogs.some(function (d) {
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
    removeFromFreeList(freeDialogs, dialog) {
        for (var i = 0; i < freeDialogs.length; i++) {
            var element = freeDialogs[i];
            if (element.getName() == dialog.getName()) {
                freeDialogs.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Kiểm tra senderId này có trong mảng chưa, chưa thì push vô rồi tạo mới các dialog
     * @param {number} senderId 
     */
    insertSender(senderId) {
        var result = false;
        this.senders.some(function (sender) {
            if (sender.senderId == senderId) {
                result = true;
                return true;
            }
        });

        if (!result) {
            var session = {brandId: 1};
            this.senders.push({
                session: session,
                senderId: senderId,
                freeDialogs: [
                    new OrderDialog(session),
                    new ShowMenuDialog(session),
                    new ShowPromotionDialog(session),
                    new HelloDialog(session),
                    new SearchProductNameDialog(session),
                    new ShowOrderHistoryDialog(session),
                    new ShowOrderDetailDialog(session),
                    new ShowStoreDialog(session)
                ],
                usingDialogs: [],
            });
        }
    }

    /**
     * Trả về freeDialog của một senderId
     * @param {number} senderId 
     */
    getFreeDialogs(senderId) {
        var result = null;
        this.senders.some(function (sender) {
            if (sender.senderId == senderId) {
                result = sender.freeDialogs;
                return true;
            }
        });
        return result;
    }

    /**
     * Trả về usingDialog của một senderId
     * @param {number} senderId 
     */
    getUsingDialogs(senderId) {
        var result = null;
        this.senders.some(function (sender) {
            if (sender.senderId == senderId) {
                result = sender.usingDialogs;
                return true;
            }
        });
        return result;
    }


}



module.exports = Brain