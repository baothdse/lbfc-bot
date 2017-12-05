let Dialog = require('./dialog');
let await = require('asyncawait/await')
const Request = require('../utils/request');
const ConsoleLog = require('../utils/console-log');

class ShowNearestStore extends Dialog {
    constructor(session) {
        super(session);
    }

    continue(input, senderId, info = null) {
        ConsoleLog.log(this.step, this.getName(), 13);
        switch (this.step) {
            case 1: this.askForLocation(input, senderId, info); break;
            case 2: this.showStore(input, senderId, info); break;
            default: this.end(); break;
        }
    }

    askForLocation(input, senderId, info) {
        this.sendLocation(senderId);
        this.step = 2;
    }

    showStore(input, senderId, info) {
        if (input.constructor === Array) {
            let coordinates = input[0].payload.coordinates;
            new Request().sendGetRequest('/LBFC/Store/GetNearbyStoreOutdoor', { "lat": coordinates.lat, "lon": coordinates.long, "brandId": this.session.brandId })
            .then((data) => {
                let listStoreNearBy = JSON.parse(data)
                console.log("DATA = " + data)
                let top4NearByStore = []
                for (let i = 0; i < 10; i++) {
                    let element = {
                        title: listStoreNearBy[i].Name,
                        image_url: listStoreNearBy[i].LogoUrl,
                        subtitle: listStoreNearBy[i].Address,
                        default_action: {
                            "type": "web_url",
                            "url": "https://foody.vn",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall"
                        }
                    }
                    top4NearByStore.push(element);
                }
                this.sendGenericMessage(senderId, top4NearByStore)
            })
        } else {
            this.sendTextMessage(senderId, `${this.session.pronoun} hông gửi địa chỉ thì em kiếm hông được đâu 😬`);
        }
        this.step = 3;
        this.continue(input, senderId, info);
    }

    getName() {
        return 'show nearest store dialog';
    }
}
module.exports = ShowNearestStore;