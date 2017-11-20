let AskOpenCloseTimeIntent = require('../intents/store/ask-open-close-time-intent');
let Dialog = require('./dialog');
let Request = require('../utils/request');

class AskOpenCloseTimeDialog extends Dialog {
    constructor(session) {
        super(session);
        this.push();
    }

    push() {
        this.addIntent(new AskOpenCloseTimeIntent(1, 0));
    }

    continue(input, senderId, info = null) {
        console.log("=====STANDING AT ASK OPEN CLOSE TIME DIALOG ====");
        console.log("STEP = " + this.step);
        switch (this.step) {
            case 1: this.answerOpenCloseTime(input, senderId); break;
            case 2: this.receiveUserAction(input, senderId); break;

            case 4: this.end();
            default: this.end();
        }
    }

    /**
     * Dùng để trả lời chung chung đại khái thời gian đóng mở cửa của các cửa hàng.
     * Sau đó hỏi user có muốn xem hết thời gian đóng mở cửa của các cửa hàng hay không
     * @param {*} input 
     * @param {*} senderId 
     */
    answerOpenCloseTime(input, senderId) {
        this.step = 2;
        new Request().sendGetRequest('/LBFC/Brand/GetWorkingHours', { brandId: 1 }, '')
            .then((data) => {
                var openCloseTimes = JSON.parse(data);
                let openTime = openCloseTimes.OpenTime;
                let closeTime = openCloseTimes.CloseTime;
                var listReplies = ['Thường thì bên em mở cửa lúc ' + openTime + ' và đóng cửa lúc ' + closeTime + '. ' + this.session.pronoun + ' có muốn hỏi chính xác cửa hàng nào ko?',
                'Bên em mở cửa lúc ' + openTime + ' và đóng cửa lúc ' + closeTime + '. Nhưng cũng có một số cửa hàng ngoại lệ!',
                'Thường thường từ ' + openTime + '-' + closeTime + '. ' + this.session.pronoun + ' có muốn biết chính xác cửa hàng nào không?']
                let replyText = this.randomReplyMessage(listReplies);
                this.sendQuickReply(senderId, replyText,
                    [{
                        content_type: 'text',
                        title: 'Xem tất cả',
                        payload: 'xem hết',
                        image_url: 'https://cdn.pixabay.com/photo/2017/08/28/17/22/clock-2690491_960_720.png'
                    }, {
                        content_type: 'text',
                        title: 'Khỏi',
                        payload: 'khỏi',
                        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Fxemoji_u274C.svg/2000px-Fxemoji_u274C.svg.png'
                    }])
            })

    }

    /**
     * Step này dùng để nhận thông tin từ user có muốn xem thời gian đóng mở cửa của tất cả cửa hàng hay không.
     * Next step : showOpenCloseTimeOfStore() hoặc end()
     * @param {*} input 
     * @param {*} senderId 
     */
    receiveUserAction(input, senderId) {
        if (input.match(/(xem hết|xem tất cả|tất cả)/i)) {
            this.step = 3;
        } else {
            this.step = 4;
            this.sendTextMessage(senderId, this.session.pronoun + ' cần giúp gì nữa ko 😚😚😚')
            this.continue(input, senderId);
        }
    }

    getName() {
        return "Ask Open Close time dialog";
    }
}

module.exports = AskOpenCloseTimeDialog;