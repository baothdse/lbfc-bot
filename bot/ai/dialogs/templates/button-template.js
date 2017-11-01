
class ButtonTemplate {
    constructor(text, buttons) {
        this.template = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": text,
                    //"image_url": image_url,
                    "buttons": buttons,
                }

            }
        }
    }



}

module.exports = ButtonTemplate