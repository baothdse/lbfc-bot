let Dialog = require('./dialog');
let Request = require('../utils/request');
let AskForMembershipIntent = require('../intents/membership/ask-for-membership');

const ConsoleLog = require('../utils/console-log');

class ShowMembershipEventDialog extends Dialog {
    constructor(session) {
        super(session);
        this.addIntent(new AskForMembershipIntent(1, 0));
        this.error = 0;
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case -1: this.continueError(input, senderId, info); break;
            case 1:
                this.responseMembershipEvent(senderId);
                break;
            case 2: this.receiveUserIntention(input, senderId); break;
            default:
                this.end();
                break;
        }
    }

    continueError(input, senderId, info = null) {
        switch (this.error) {
            case 1:
                this.askForCoordinates(senderId); break;
            case 2:
                this.receiveCoordinates(input, senderId); break;
            default: break;
        }
    }

    /**
     * Step 1
     * @param {*} senderId 
     */
    responseMembershipEvent(senderId) {
        this.sendTextMessage(senderId, `Bên em có chương trình tạo thẻ thành viên nha ${this.session.pronoun.toLowerCase()}`)
            .then((response) => {
                this.sendTextMessage(senderId, `${this.session.pronoun} có thể tới cửa hàng gần nhất để tạo nha.`)
                    .then((response) => {
                        let elements = [
                            {
                                content_type: "text",
                                title: "Ok",
                                payload: "store nearby",
                                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                            }, {
                                content_type: "text",
                                title: "Thôi khỏi",
                                payload: "store refuse",
                                image_url: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/shop-icon.png"
                            }
                        ]
                        this.sendQuickReply(senderId, `${this.session.pronoun} có cần tìm cửa hàng gần đây để đi cho nhanh không?`, elements)
                    })
            })
        this.step = 2;
    }

    /**
     * Step 2
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveUserIntention(input, senderId) {
        if (input.match(/(store nearby|ok|ừ|ừm|ừn|uhm|tìm)/i)) {
            if (!this.session.coordinates) {
                this.step = -1;
                this.error = 1;
                this.continue(input, senderId);
            } else {
                this.step = 3;
                this.continue('', '');
                this.sendTextMessage(senderId, `Đây ${this.session.pronoun.toLowerCase()}`);
                new Request().sendGetRequest('/LBFC/Store/GetNearbyStoreOutdoor', { "lat": this.session.coordinates.lat, "lon": this.session.coordinates.long, "brandId": this.session.brandId })
                    .then((data) => {
                        let listStoreNearBy = JSON.parse(data)
                        let top4NearByStore = []
                        for (let i = 0; i < 4; i++) {
                            let element = {
                                title: listStoreNearBy[i].Name,
                                image_url: listStoreNearBy[i].LogoUrl,
                                subtitle: listStoreNearBy[i].Address,
                                default_action: {
                                    "type": "web_url",
                                    "url": "https://foody.vn",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall"
                                },
                            }
                            top4NearByStore.push(element);
                        }
                        this.sendGenericMessage(senderId, top4NearByStore)
                    })
                    .catch((err) => {
                        this.sendTextMessage(senderId, `${this.session.pronoun} ơi đợi xíu nha, bên em đang trục trặc xíu, hì hì`);
                    })

            }
        } else {
            this.step = 3;
            this.continue('', '');
            this.sendTextMessage(senderId, `ok ${this.session.pronoun.toLowerCase()}`);
        }
    }

    /*-----------------Error-----------------*/
    askForCoordinates(senderId) {
        this.sendLocation(senderId);
        this.step = -1;
        this.error = 2;
    }

    receiveCoordinates(input, senderId) {
        if (input[0].payload == undefined) {
            this.session.coordinates = {
                lat: 10.779853,
                long: 106.69898560000001,
            };
        } else {
            this.session.coordinates = input[0].payload.coordinates;
        }
        this.step = 2;
        this.error = 0;
        this.continue('ok', senderId);
    }

    getName() {
        return "show membership event dialog";
    }
}

module.exports = ShowMembershipEventDialog