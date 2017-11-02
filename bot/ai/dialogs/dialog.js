"use strict"
let ClassParser = require('../utils/class-parser');
let Intent = require('../intents/intent');
let request = require('request-promise');
let key = process.env.googleAPIkey || 'AIzaSyC2atcNmGkRy3pzTskzsPbV6pW68qe_drY';
const FACEBOOK_ACCESS_TOKEN = 'EAAFHmBXhaYoBAFdbrN3n2nazaGfq3UOdzqvr2ZA750TZBaEi2rKorkMlZCXIo6Yl7pn9tZBBBwt6iAmV9VyKKqyX5pmB05zBLZC3iBwqgFth4ClGhWE7EPqvDsHjULGBGj4oG7qIcecqwzxoQ4w4NmCO5EAZALIvj1cgerF5nTCwZDZD';

class Dialog {
    constructor(session) {
        this.step = 1;
        this.patterns = [];
        this.status = "new"; //new hoặc end
        this.posToAnalyze = 0;
        this._storedUsers = {};
        this.intents = [];
        this.session = session;
    }

    pause() {
        this.step--;
    }

    isMatch(input, senderId) {
        var result = null;
        var that = this;

        this.intents.some(function(intent) {
            result = intent.match(input);
            console.log("MATCH RESULTSMATCH RESULTS")
            console.log(result)
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
                            payment_method : "Tiền mặt", 
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
        console.log("đã vô quick reply")
        var messageData = {
            "text": text,
            "quick_replies": quickReplyElement
        }
        request({
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

                }, function (error, response, body) {
                    console.log(body);
                    var person = JSON.parse(body);
                    that._storedUsers[senderId] = person;
                    resolve(person);
                });
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

    sendGenericMessage(senderId, payloadElements) {
        
        var messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": []
                }
            }
        };

        messageData.attachment.payload.elements = payloadElements;
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            body: 
            { whitelisted_domains: 
               [ 
                 'https://www.foody.vn/',
             ] },
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

}

module.exports = Dialog