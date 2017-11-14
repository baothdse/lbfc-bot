let Dialog = require('./dialog');
let await = require('asyncawait/await')
let PostbackAddMembership = require('../intents/membership/postback-add-membership-to-facebook');
const Request = require('../utils/request');
const await = require('asyncawait/await');

class AskForMembershipDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new PostbackAddMembership(1, 0));
    }

    continue(input, senderId, info = null) {
        switch (this.step) {
            case 1: this.askForMembershipCard(input, senderId); break;
            case 2: this.receiveMembershipCard(input, senderId); break;
            default: this.end();
        }
    }

    /**
     * Step 1
     * @param {*} input 
     * @param {*} senderId 
     */
    askForMembershipCard(input, senderId) {
        this.sendTextMessage(senderId, 'Mã thẻ của bạn là gì?');
        this.step = 2;
    }

    /**
     * Step 2
     */
    receiveMembershipCard(input ,senderId) {
        let params = {
            facebookPSID: senderId,
            cardCode: input,
        }
        new Request().sendPostRequest('/LBFC/Membership/InsertFacebookPSID')
        .then((response) => {
            if (response === 'Membership card not found') {
                this.sendTextMessage(senderId, `${this.session.pronoun} ơi, em không kiếm thấy mã thẻ này. ${this.session.pronoun} nhập lại được không?`);
                this.step = 2;
            } else {
                this.sendTextMessage(senderId, `Em đã nhận được mã thẻ rồi ^^`);
                this.step = 3;
                this.continue('', '');
            }
        });
    }

    getName() {
        return 'ask for membership dialog';
    }
}
module.exports = AskForMembershipDialog;