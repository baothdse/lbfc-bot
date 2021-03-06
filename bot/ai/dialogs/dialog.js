"use strict"
let ClassParser = require('../utils/class-parser');
let Intent = require('../intents/intent');
let request = require('request-promise');
let key = process.env.googleAPIkey || 'AIzaSyC2atcNmGkRy3pzTskzsPbV6pW68qe_drY';
const PASSIO_ACCESS_TOKEN = 'EAAFHmBXhaYoBAB1yFOWK3YR74AOvLmZBykxjucchGhWFFiK5HUEBWeLAIlDqtAs5QLi3ZCqPTvZBHwKBI2ZAfi6fYNBMJIAkV7UTt1WEPXkedJQLa82yOTtzOKzW2mEVBH3666ltmcEkHEiSxvX67eR9MkSJIZAtEWfzSWL2JZCAZDZD';
const KFC_ACCESS_TOKEN = 'EAAFHmBXhaYoBAB1yFOWK3YR74AOvLmZBykxjucchGhWFFiK5HUEBWeLAIlDqtAs5QLi3ZCqPTvZBHwKBI2ZAfi6fYNBMJIAkV7UTt1WEPXkedJQLa82yOTtzOKzW2mEVBH3666ltmcEkHEiSxvX67eR9MkSJIZAtEWfzSWL2JZCAZDZD';
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
         * @type {{brandId: number, pronoun: string, coordinates: [], searchProductDialog: {productName, topPrice, bottomPrice}, orderDialog: {orderDetails: [{productID, productName, price, picURL, discountPrice, productCode, extras: [{productId, productName, price}], note: {extra: string}], originalPrice: number, finalPrice: number, currentProduct: ProductModel, currentPromotion: {PromotionDetailID, PromotionCode, BuyProductCode, DiscountRate, DiscountAmount}, address: string, membershipCardCode: any, timeNote: string}, changeOrderDialog: {currentProduct}}}
         */
        this.session = session;
        this.exception = 0;
        this.FACEBOOK_ACCESS_TOKEN = this.session.brandId == 1 ? PASSIO_ACCESS_TOKEN : KFC_ACCESS_TOKEN
        //this.FACEBOOK_ACCESS_TOKEN = PASSIO_ACCESS_TOKEN
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

    convertWordToNumber(input) {
        let result = 0;
        let khong = {words: 'không khong', number: 0};
        let mot = {words: 'một mot', number: 1};
        let hai = {words: 'hai', number: 2};
        let ba = {words: 'ba', number: 3};
        let bon = {words: 'bốn bon', number: 4};
        let nam = {words: 'năm nam', number: 5};
        let sau = {words: 'sáu sau', number: 6};
        let bay = {words: 'bảy bay', number: 7};
        let tam = {words: 'tám tam', number: 8};
        let chin = {words: 'chín chin', number: 9};
        let muoi = {words: 'mười muoi', number: 10};
        let numberByWordArray = [mot, hai, ba, bon, nam, sau, bay, tam, chin, muoi];
        for (var i = 0; i < numberByWordArray.length; i++) {
            if(numberByWordArray[i].words.match(input)) {
                result  =numberByWordArray[i].number;
                break;
            }
        }
        console.log("RESULT CONVERT WORD TO NUMBER : " + result)
        return parseInt(result);
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
            qs: { access_token: this.FACEBOOK_ACCESS_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: senderId },
                message: {
                    text: `Cho em biết địa điểm của ${this.session.pronoun} đi`,
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

    sendReceipt(senderId, recipientName, orderNumber, orderUrl, address, summary, adjustments, elements, paymentMethod) {
        console.log("đã chạy vào send receipt")
        if (adjustments.length == 0) {
            return request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: this.FACEBOOK_ACCESS_TOKEN },
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
                                payment_method: paymentMethod,
                                order_url: orderUrl,
                                timestamp: Math.round(new Date().getTime() / 1000) + "",
                                address: address,
                                summary: summary,
                                elements: elements
                            }
                        }
                    }
                }
            })
        } else {
            return request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: this.FACEBOOK_ACCESS_TOKEN },
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
                                payment_method: paymentMethod,
                                order_url: orderUrl,
                                timestamp: Math.round(new Date().getTime() / 1000) + "",
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
    }

    sendQuickReply(senderId, text, quickReplyElement) {
        var messageData = {
            "text": text,
            "quick_replies": quickReplyElement
        }
        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: this.FACEBOOK_ACCESS_TOKEN },
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
                        access_token: this.FACEBOOK_ACCESS_TOKEN
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
            qs: { access_token: this.FACEBOOK_ACCESS_TOKEN },
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
            qs: { access_token: this.FACEBOOK_ACCESS_TOKEN },
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
                access_token: this.FACEBOOK_ACCESS_TOKEN
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
                access_token: this.FACEBOOK_ACCESS_TOKEN
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
                access_token: this.FACEBOOK_ACCESS_TOKEN
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
                    url: imageUrl,
                }
            }
        };
        return request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: this.FACEBOOK_ACCESS_TOKEN
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
                access_token: this.FACEBOOK_ACCESS_TOKEN
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