"use strict"
let ClassParser = require('../utils/class-parser');
let Intent = require('../intents/intent');
let request = require('request-promise');
let key = process.env.googleAPIkey || 'AIzaSyC2atcNmGkRy3pzTskzsPbV6pW68qe_drY';
const FACEBOOK_ACCESS_TOKEN = 'EAAFHmBXhaYoBAJR68ofNMorzRjAXNmCyZCZBXOnRXMLDuiZA66KgvHxcijb2SidQc3zRm2AsAijnaGliTCZCf4iiDmApFMfEoRFVmatHIMrKKY7tdtDSzMqgOQXlOjqFHZCFRmquVAK0DERbnA8Gp57kGJlSwV9ZBqoXC5dxHAyAZDZD';
let ConsoleLog = require('../utils/console-log');
const ProductModel = require('./entities/products/product');

class Dialog {

    constructor(session) {
        this.step = 1;
        this.patterns = [];
        this.status = "new"; //new hoặc end
        this.posToAnalyze = 0;
        this._storedUsers = {};
        this.emojiArray = ['😬','😂','😄','🙂','😊','😉','😇','😅','😋','😌','😍','😘','😗','😎','😛','😝','😜','😚','😙','😶','👍'];

        /**
         * @type {[Intent]}
         */
        this.intents = [];
        /**
         * @type {{brandId: number, pronoun: string, coordinates: [], searchProductDialog: {productName, topPrice, bottomPrice}, orderDialog: {orderDetails: [{productID, productName, price, picURL, discountPrice, productCode, extras: [{productId, productName, price}], note: {extra: string, time: string}], originalPrice: number, finalPrice: number, currentProduct: ProductModel, currentPromotion: {PromotionDetailID, PromotionCode, BuyProductCode, DiscountRate, DiscountAmount}, address: string}}}
         */
        this.session = session;
        this.exception = 0;
    }

    pause() {
        --this.step;
    }

    isMatch(input, senderId) {
        var result = null;
        var that = this;

        this.intents.some(function (intent) {
            result = intent.match(input);
            if (result != null) {
                that.step = result.step;
                that.exception = result.exception;
                that.continue(input, senderId, result);
                return true;
            }
        }, this);
        return result != null;
    }

    reset() {
        this.status = "new";
    }

    addIntent(intent) {
        this.intents.push(intent);
    }

    end() {
        this.status = "end";
    }

    /**
     * send random emoji
     * @param {*} senderId 
     */
    sendEmoji(senderId) {
        let emoji = this.randomReplyMessage(this.emojiArray);
        this.sendTextMessage(senderId, emoji);
    }

    /**
     * Nhắc lại cho user khi nhập không đúng format text cho bước tiếp theo
     * @param {string} input 
     * @param {int} senderId 
     * @param {int} returnStep step để trở về
     */
    remindFormat(remindText, senderId, returnStep) {
        this.reply(senderId, new SimpleTextTemplate(remindText).template);
        this.step = returnStep;
        this.continue('', senderId);
    }

    sendLocation(senderId) {
        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: {
                    text: "Vui lòng cho chúng tôi biết địa điểm để có thể hỗ trợ bạn tốt hơn",
                    quick_replies: [
                        {
                            content_type: "location"
                        },
                        {
                            content_type: "text",
                            title: "Bỏ qua",
                            payload: "location skip",
                            image_url: "https://cdn4.iconfinder.com/data/icons/defaulticon/icons/png/256x256/no.png"
                        }
                    ]
                }
            }
        })
    }

    sendReceipt(senderId, recipientName, orderNumber, orderUrl, address, summary, adjustments, elements) {
        console.log("đã chạy vào send receipt")
        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "receipt",
                            recipient_name: recipientName,
                            order_number: orderNumber,
                            currency: "VND",
                            payment_method: "Tiền mặt",
                            order_url: orderUrl,
                            timestamp: "1428444852",
                            address: address,
                            summary: summary,
                            adjustments: adjustments,
                            elements: elements
                        }
                    }
                }
            }
        })
    }

    sendQuickReply(senderId, text, quickReplyElement) {
        var messageData = {
            "text": text,
            "quick_replies": quickReplyElement
        }
        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: messageData
            }
        });
    };


    getSenderName(senderId) {
        var that = this;
        return new Promise((resolve, reject) => {
            if (that._storedUsers[senderId]) {
                resolve(that._storedUsers[senderId]);
            }
            else {
                request({
                    url: `https://graph.facebook.com/v2.6/${senderId}`,
                    qs: {
                        access_token: FACEBOOK_ACCESS_TOKEN
                    },
                    method: 'GET',

                })
                    .then((body) => {
                        console.log(body);
                        var person = JSON.parse(body);
                        that._storedUsers[senderId] = person;
                        resolve(person);
                    })
            }
        });
    }

    reply(senderId, message) {

        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: message,
            }
        });
    };

    sendTyping(senderId) {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                sender_action: 'typing_on',
            }
        });
    }

    /**
     * Gửi text message thông thường
     * @param {number} senderId 
     * @param {string} text text muốn gửi
     */
    sendTextMessage(senderId, text) {
        var messageData = {
            text: text
        };
        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            method: 'POST',
            json: {
                recipient: {
                    id: senderId
                },
                message: messageData,
            }
        })
    }

    sendButtonMessage(senderId, text, buttons) {
        var messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": text,
                    "buttons": buttons
                }
            }
        };

        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            method: 'POST',
            json: {
                recipient: {
                    id: senderId
                },
                message: messageData,
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            }
            else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }

    sendAttachmentBack(senderId, attachment) {
        var messageData = {
            attachment: attachment
        };
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            method: 'POST',
            json: {
                recipient: {
                    id: senderId
                },
                message: messageData,
            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            }
            else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }

    sendImage(senderId, imageUrl) {
        var messageData = {
            attachment: {
                type: "image",
                payload: {
                    url: imageUrl
                }
            }
        };
        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            method: 'POST',
            json: {
                recipient: {
                    id: senderId
                },
                message: messageData,
            }
        });
    }

    sendGenericMessage(senderId, payloadElements) {

        var messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": payloadElements
                }
            }
        };

        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            body:
            {
                whitelisted_domains:
                [
                    'https://www.foody.vn/',
                ]
            },
            method: 'POST',
            json: {
                recipient: {
                    id: senderId
                },
                message: messageData,
            }
        });
    }

    /**
     * Dùng để chọn ngẫu nhiên 1 câu trả lời trong mảng gồm các câu trả lời
     * @param {*} Array
     * @returns {*} Câu trả lời trong mảng gồm các câu trả lời 
     */
    randomReplyMessage(replyMessageArr) {
        let replyMessage = replyMessageArr[Math.floor(Math.random() * replyMessageArr.length)]
        return replyMessage;
    }

}

module.exports = Dialog