"use strict"
var Response = require('./entities/response');
let ClassParser = require('../utils/class-parser');
let Pattern = require('./entities/pattern');

let request = require('request');

const FACEBOOK_ACCESS_TOKEN = 'EAAFHmBXhaYoBAL2yFSGcdsPAsqfVd9GCBbAW4UUfnZCMj8OFBkkcZC6svxFsZA4J81zopxZAzrqHpiDlpdM22ainLm7SzvIsGJhpuhagH0OPkuyFP6CYHZCK3MwIFE9iJCY2vCI4M6hl9cytLdUWEylHnmMAfWXnWr3BA1dqEDQZDZD';

class Dialog {
    constructor() {
        this.step = 1;
        this.patterns = [];
        this.status = "new"; //new hoặc end
        this.posToAnalyze = 0;
    }

    isMatch(input) {
        var result = false;
        var that = this;
        this.patterns.some(function (pattern) {
            var p = pattern.isMatch(input);
            if (p != null) {
                that.posToAnalyze = p[0].length + 1;
                that.step = pattern.getStep();
                result = true;
                return true;
            }
        }, this);
        return result;
    }

    addPatterns(arrayOfClassName, step) {
        var parser = new ClassParser.ClassParser(arrayOfClassName);
        var patternParsed = parser.parse();
        var that = this;
        patternParsed.forEach(function (p) {
            that.patterns.push(new Pattern.Pattern(p, step));
        }, this);
    }

    end(senderId) {
        this.status = "end";
        this.reply(senderId, { 'text': 'Oke' });
    }

    continue(input) {

    }

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
                        access_token: that._token
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
                access_token: this._token
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
                access_token: this._token
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
                access_token: this._token
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
                access_token: this._token
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
                access_token: this._token
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