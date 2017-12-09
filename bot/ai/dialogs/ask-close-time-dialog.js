let Dialog = require('./dialog');
let async = require("asyncawait/async");
let await = require("asyncawait/await");
let Request = require('../utils/request');
const googleAPIkey = 'AIzaSyC2atcNmGkRy3pzTskzsPbV6pW68qe_drY';
const ConsoleLog = require('../utils/console-log');

class AskCloseTimeDialog extends Dialog {
    constructor(session) {
        super(session);
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            // case 1: this.askLocation(senderId); break;
            case 1: this.showOpeningTime(input, senderId, info); break;
            default: this.end(); break;
        }
    }

    showOpeningTime(input, senderId, info) {
        this.step = 2;
        let param = {
            brandId : this.session.brandId,
        }
        new Request().sendGetRequest('/LBFC/Brand/GetClosingTime', param, '')
        .then((res) => {
            let data = JSON.parse(res);
            let string = '';
            Object.keys(data).forEach((key, value) => {
                string += key + " - " + data[key] + "\n";
                if (string.length > 100) {
                    this.sendTextMessage(senderId, string);
                    string = "";
                }
            });
            if (string != "")
                this.sendTextMessage(senderId, string);
        });
        this.continue('', '');
    }

    getName() {
        return "ask open time dialog";
    }
}

module.exports = AskCloseTimeDialog;
