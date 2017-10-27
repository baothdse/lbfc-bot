
class LoadMoreMenuTemplate {
    constructor() {
        this.template = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    'text' : 'Bạn có muốn xem thêm không?',
                    'buttons' : [
                        {
                            'type' : 'postback',
                            'title': 'Có',
                        }
                    ]
                }
            }
        }
    }
}