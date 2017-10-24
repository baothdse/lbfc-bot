"use strict"
var Response = require('./entities/response');
let ClassParser = require('../utils/class-parser');
let Pattern = require('./entities/pattern');

let request = require('request');

const FACEBOOK_ACCESS_TOKEN = 'EAAFHmBXhaYoBAFdbrN3n2nazaGfq3UOdzqvr2ZA750TZBaEi2rKorkMlZCXIo6Yl7pn9tZBBBwt6iAmV9VyKKqyX5pmB05zBLZC3iBwqgFth4ClGhWE7EPqvDsHjULGBGj4oG7qIcecqwzxoQ4w4NmCO5EAZALIvj1cgerF5nTCwZDZD';

class Dialog {
    constructor() {
        this.step = 1;
        this.patterns = [];
        this.status = "new"; //new hoặc end
        this.posToAnalyze = 0;
        this._storedUsers = {};
    }

    pause() {
        this.step--;
    }

    isMatch(input) {
        var result = false;
        var that = this;
        this.patterns.some(function (pattern) {
            var p = pattern.isMatch(input);
            if (p != null) {
                console.log('dialog: ------> pattern = ' + pattern.string + ', input = ' + input);
                that.posToAnalyze = p[0].length + 1;
                that.step = pattern.getStep();
                result = true;
                return true;
            }
        }, this);
        return result;
    }
    reset() {
        this.status = "new";
    }

    addPatterns(arrayOfClassName, step) {
        var parser = new ClassParser.ClassParser(arrayOfClassName);
        var patternParsed = parser.parse();
        var that = this;
        patternParsed.forEach(function (p) {
            that.patterns.push(new Pattern(p, step));
        }, this);
    }

    end(senderId) {
        this.status = "end";
        this.reply(senderId, { 'text': 'Oke' });
    }

    continue(input) {

    }

    sendReceipt(senderId, recipientName, orderNumber, paymentMethod, orderUrl, address, summary, adjustments, elements) {
        console.log("đã chạy vào send receipt")
        request({
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
                            payment_method : "Visa 2345", 
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
                    var person = JSON.parse(body);
                    that._storedUsers[senderId] = person;
                    resolve(person);
                });
            }
        });
    }

    reply(senderId, message) {
        
        request({
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