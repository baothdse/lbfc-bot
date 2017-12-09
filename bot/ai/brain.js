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
let AskDeliveryDialog = require('./dialogs/ask-delivery-dialog')
let SearchPopularProducts = require('./dialogs/show-popular-products-dialog');
const ShowMembershipEventDialog = require('./dialogs/show-membership-event-dialog');
const OneStepDialog = require('./dialogs/one-step-dialog');
const ChangeOrderDialog = require('./dialogs/change-order-dialog')
let AskOpenCloseTimeDialog = require('./dialogs/ask-open-close-time-dialog');
let AskDeliveryTimeDialog = require('./dialogs/delivery/ask-delivery-time-dialog');
let EmojiDialog = require('./dialogs/emoji/emoji-dialog');
var Response = require('./dialogs/entities/response');
let Dialog = require('./dialogs/dialog');
const ShowNearestStoreDialog = require('./dialogs/show-nearest-store-dialog');
const ShowCartDialog = require('./dialogs/show-cart-dialog');
const SimpleChangeOrderDialog = require('./dialogs/simple-change-order-dialog');
const SimpleDeleteOrderDialog = require('./dialogs/simple-delete-order-dialog');
const AskOpenTimeDialog = require('./dialogs/ask-open-time-dialog');
const AskCloseTimeDialog = require('./dialogs/ask-close-time-dialog');
let AskBookingDialog = require('./dialogs/booking/ask-booking-dialog')
let HowToOrderDialog = require('./dialogs/order/how-to-order-dialog')
const Enums = require('./enum');
const Util = require('./utils/util');

let ConsoleLog = require('./utils/console-log');
const EditDistance = require('./utils/edit-distance');

const Intent = require('./intents/intent');

class Brain {

    /**
     * 
     * @param {RedisClient} client 
     */
    constructor(client) {
        //this.vietnameseConverter = new VietnameseConverter();

        /**
         * @type {[{'senderId' : number, 'freeDialogs' : [], 'usingDialogs' : [], 'session': any}]}
         */
        this.senders = [];

        this.client = client;
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
                    } else if (event.message && event.message.sticker_id) {
                        this.response(event, 'sticker');
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
        let understood = false;
        const senderId = event.sender.id;
        var message = '';
        let canResponse = true;
        switch (type) {
            // case 'message': message = this.vietnameseConverter.convert(event.message.text); break;
            case 'message': message = event.message.text; break;
            case 'postback': message = event.postback.payload; break;
            case 'attachments': message = event.message.attachments; break;
            case 'quick_reply': message = event.message.quick_reply.payload; break;
            default: canResponse = false; new Dialog({}).sendTextMessage(senderId, `Gửi tin nhắn thôi ạ. Sticker, hình hay video gì thì chưa hỗ trợ nhé`); break;
        }
        if (!canResponse)
            return;

        ConsoleLog.log(event, 'brain.js', 79);

        this.insertSender(senderId, event.recipient.id)
            .then((res) => {

                this.client.get(Enums.REDIS_KEY(), (err, value) => {
                    /**
                     * @type {[{DialogId: number, Exception: number, Id: number, Step: number, Patterns: [{Id: number, Entities: [{Id, Words}]}]}]}
                     */
                    let intents = JSON.parse(value);
                    var usingDialogs = this.getUsingDialogs(senderId);

                    let session = this.getUserSession(senderId);

                    var currentDialog = usingDialogs[usingDialogs.length - 1];
                    var beginNewDialog = false;

                    let intent = (type == 'message' || type == 'quick_reply' || type == 'postback') ? Intent.getSuitableIntent(message, intents) : { Results: null };

                    if (intent.Results == null && currentDialog != null) {

                        let currentStep = currentDialog.step;
                        currentDialog.continue(message, senderId);
                        understood = currentDialog.step > currentStep;
                        if (currentDialog.status == "end") {
                            this.removeFromUsingList(usingDialogs, currentDialog);
                            let newCurrentDialog = usingDialogs[usingDialogs.length - 1];
                            if (newCurrentDialog != undefined) {
                                setTimeout(() => newCurrentDialog.continue(message, senderId), 3000);
                                currentDialog = newCurrentDialog;
                            }
                        }

                        if (currentDialog != undefined && currentDialog.status == "end") {
                            this.removeFromUsingList(usingDialogs, currentDialog);
                            let newCurrentDialog = usingDialogs[usingDialogs.length - 1];
                            if (newCurrentDialog != undefined) {
                                setTimeout(() => newCurrentDialog.continue(message, senderId), 3000);
                            }
                        }
                    } else if (intent.Results != null) {

                        let dialog = this.getDialog(intent.DialogId, session);
                        let matchedDialog = this.removeToUsingList(usingDialogs, dialog);

                        if (matchedDialog != null) {
                            let d = usingDialogs[usingDialogs.length - 1];
                            if (d != undefined) d.pause();
                            usingDialogs.push(matchedDialog[0]);
                            dialog = matchedDialog[0];

                        } else {
                            let d = usingDialogs[usingDialogs.length - 1];
                            if (d != undefined) d.pause();
                            usingDialogs.push(dialog);
                        }


                        let info = Intent.analyze(intent);

                        dialog.step = intent.Step;
                        dialog.exception = intent.Exception;
                        dialog.continue(message, senderId, info);
                        understood = true;

                        // setTimeout(() => ConsoleLog.log(usingDialogs[0].session.orderDialog, 'brain.js', 138), 5000);

                        if (dialog.status == "end") {
                            this.removeFromUsingList(usingDialogs, dialog);
                            let newCurrentDialog = usingDialogs[usingDialogs.length - 1];
                            if (newCurrentDialog != undefined) {
                                setTimeout(() => newCurrentDialog.continue(message, senderId), 3000);
                                currentDialog = newCurrentDialog;
                            }
                        }

                        if (currentDialog != undefined && currentDialog.status == "end") {
                            this.removeFromUsingList(usingDialogs, currentDialog);
                            let newCurrentDialog = usingDialogs[usingDialogs.length - 1];
                            if (newCurrentDialog != undefined) {
                                setTimeout(() => newCurrentDialog.continue(message, senderId), 3000);
                            }
                        }
                    }

                    if (!understood) {
                        this.handleUnexpectedInput(message, senderId, this.getUserSession(senderId), event.recipient);
                    }
                });

            })

            .catch((err) => {
                ConsoleLog.log(err, 'brain.js', 144);
            })

    }

    getGender(senderId, session) {
        return new Dialog(session).getSenderName(senderId)
            .then((sender) => {
                if (!session.pronoun) {

                    if (sender.gender == 'male') {
                        session.pronoun = 'Anh'
                    } else if (sender.gender == 'female') {
                        session.pronoun = 'Chị'
                    }

                }
            });

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
     * Loại bỏ các dialog hiện tại và trở về dialog được chọn
     * @param {[]} usingDialogs 
     * @param {*} dialog 
     */
    removeToUsingList(usingDialogs, dialog) {
        for (var i = 0; i < usingDialogs.length; i++) {
            var element = usingDialogs[i];
            if (element.getName() == dialog.getName()) {
                return usingDialogs.splice(i, 1);
                break;
            }
        }
        return null;
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
    insertSender(senderId, pageId) {
        var result = false;
        this.senders.some(function (sender) {
            if (sender.senderId == senderId && sender.session.pageId == pageId) {
                result = true;
                return true;
            }
        });

        if (!result) {
            var session = { pageId: pageId, notUnderstood: 0 };
            if (pageId == '119378645455883') {
                session.brandId = 1;
            } else {
                session.brandId = 4;
            }
            this.senders.push({
                session: session,
                senderId: senderId,
                usingDialogs: [],
            });
            return this.getGender(senderId, this.senders[this.senders.length - 1].session);
        } else {
            return new Promise((resolve, reject) => { resolve("") });
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
     * @returns {[Dialog]}
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

    getUserSession(senderId) {
        var result = null;
        this.senders.some((sender) => {
            if (sender.senderId == senderId) {
                result = sender.session;
                return true;
            }
        })
        return result;
    }

    /**
     * 
     * @param {*} input 
     * @param {*} senderId 
     * @param {*} session 
     * @param {*} recipient 
     */
    handleUnexpectedInput(input, senderId, session, recipient) {
        if (input.match(/message refined /i)) {
            let match = input.match(/message refined /i);
            let message = input.substring(match.index + match[0].length, input.length);
            let event = { message: { text: message }, sender: { id: senderId }, recipient: recipient };
            this.response(event, 'message');
            return;
        } else if (input.match(/message decline/i)) {
            new Dialog(session).sendTextMessage(senderId, `${session.pronoun} thử đổi vài chữ xem em có hiểu không, hì hì`);
            return;
        }
        let minPattern = { string: '', distance: 1000 };

        this.client.get('BotPatterns', (err, value) => {

            /**
             * @type {[string]}
             */
            let patterns = JSON.parse(value);
            let minPattern = { string: '', min: 1000 }
            patterns.forEach((pattern) => {
                let d = EditDistance.levenshteinDistance(input, pattern);
                if (d < minPattern.min) {
                    minPattern.string = pattern.replace('\\d+', '[số]').replace('\\w+', '[chữ]').replace('.*?', '[chữ]');
                    minPattern.min = d;
                }
            })

            let elements = [
                {
                    content_type: "text",
                    title: "Đúng rồi",
                    payload: `message refined ${minPattern.string}`,
                    image_url: Enums.LIKE_ICON_URL(),
                },
                {
                    content_type: "text",
                    title: "Hông phải",
                    payload: `message decline`,
                    image_url: Enums.DISLIKE_ICON_URL()
                }
            ]
            new Dialog(session).sendQuickReply(senderId, `Có phải ý ${session.pronoun.toLowerCase()} là *${minPattern.string}*?`, elements)
                .catch((err) => ConsoleLog.log(err, 'brain.js', 357));

        })

    }


    getDialog(dialogId, session) {
        switch (dialogId) {
            case Enums.ASK_DELIVERY_DIALOG_ID(): return new AskDeliveryDialog(session); break;
            case Enums.ASK_OPEN_CLOSE_TIME_DIALOG_ID(): return new AskOpenCloseTimeDialog(session); break;
            case Enums.CHANGE_ORDER_DIALOG_ID(): return new ChangeOrderDialog(session); break;
            case Enums.HELLO_DIALOG_ID(): return new HelloDialog(session); break;
            case Enums.ONE_STEP_DIALOG_ID(): return new OneStepDialog(session); break;
            case Enums.ORDER_DIALOG_ID(): return new OrderDialog(session); break;
            case Enums.SEARCH_PRODUCT_NAME_DIALOG_ID(): return new SearchProductNameDialog(session); break;
            case Enums.SHOW_MEMBERSHIP_EVENT_DIALOG_ID(): return new ShowMembershipEventDialog(session); break;
            case Enums.SHOW_MENU_DIALOG_ID(): return new ShowMenuDialog(session); break;
            case Enums.SHOW_ORDER_DETAIL_DIALOG_ID(): return new ShowOrderDetailDialog(session); break;
            case Enums.SHOW_ORDER_HISTORY_DIALOG_ID(): return new ShowOrderHistoryDialog(session); break;
            case Enums.SHOW_POPULAR_PRODUCT_DIALOG_ID(): return new SearchPopularProducts(session); break;
            case Enums.SHOW_PROMOTION_DIALOG_ID(): return new ShowPromotionDialog(session); break;
            case Enums.SHOW_STORE_DIALOG_ID(): return new ShowStoreDialog(session); break;
            case Enums.SHOW_NEAREST_STORE_DIALOG_ID(): return new ShowNearestStoreDialog(session); break;
            case Enums.SHOW_CART_DIALOG_ID(): return new ShowCartDialog(session); break;
            case Enums.SIMPLE_CHANGE_DIALOG_ID(): return new SimpleChangeOrderDialog(session); break;
            case Enums.SIMPLE_DELETE_DIALOG_ID(): return new SimpleDeleteOrderDialog(session); break;
            case Enums.ASK_OPEN_TIME_DIALOG_ID(): return new AskOpenTimeDialog(session); break;
            case Enums.ASK_CLOSING_TIME_DIALOG_ID(): return new AskCloseTimeDialog(session); break;
            case Enums.ASK_BOOKING_DIALOG_ID(): return new AskBookingDialog(session); break;
            case Enums.HOW_TO_ORDER_DIALOG_ID(): return new HowToOrderDialog(session); break;
            case Enums.SHOW_MENU_DIALOG_ID(): return new ShowMenuDialog(session); break;
            default: return null;
        }
    }

}



module.exports = Brain