const express = require('express');
const bodyParser = require('body-parser');
const verificationController = require('./controllers/verification');
const redis = require('redis');

const Brain = require('./bot/ai/brain');
var request = require('request');
const FB_TOKEN = 'EAAFHmBXhaYoBAFdbrN3n2nazaGfq3UOdzqvr2ZA750TZBaEi2rKorkMlZCXIo6Yl7pn9tZBBBwt6iAmV9VyKKqyX5pmB05zBLZC3iBwqgFth4ClGhWE7EPqvDsHjULGBGj4oG7qIcecqwzxoQ4w4NmCO5EAZALIvj1cgerF5nTCwZDZD';
const app = express();

let client = redis.createClient();
client.on("connected", () => {
    console.log('connected to redis');
})

var brain = new Brain(client);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post('/', brain.receive.bind(brain));
app.get('/', verificationController);

app.listen(5000, () => console.log("Webhook server start at 5000"));



function addPersistentMenu() {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: { access_token: FB_TOKEN },
        method: 'POST',
        json: {
            "get_started": {
                "payload": "GET_STARTED_PAYLOAD"
            }
        }
    }, function (error, response, body) {
        console.log("Add persistent menu " )
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: { access_token: FB_TOKEN },
        method: 'POST',
        json: {
            "persistent_menu": [
                {
                    "locale": "default",
                    "call_to_actions": [
                        {
                            "title": "Trang chủ",
                            "type": "web_url",
                            "url": "http://localhost:42013",
                            "webview_height_ratio": "compact"
                        },
                        {
                            "title": "Tài khoản của tôi",
                            "type": "nested",
                            "call_to_actions": [
                                {
                                    "title": "Khuyến mãi của tôi",
                                    "type": "postback",
                                    "payload": "Khuyến mãi của tôi"
                                },
                                {
                                    "title": "Điểm tích lũy",
                                    "type": "postback",
                                    "payload": "Điểm tích lũy"
                                },
                                {
                                    "title": "Lịch sử giao dịch",
                                    "type": "web_url",
                                    "url" : "https://tiki.vn/sales/order/history/",                                    
                                    "webview_height_ratio": "compact"
                                }
                            ]
                        }
                    ]
                },
                {
                    "locale": "zh_CN",
                    "composer_input_disabled": false
                }
            ]
        }
    }, function (error, response, body) {
        
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}




// function removePersistentMenu() {
//     request({
//         url: 'https://graph.facebook.com/v2.6/me/thread_settings',
//         qs: { access_token: process.env.FB_TOKEN },
//         method: 'POST',
//         json: {
//             setting_type: "call_to_actions",
//             thread_state: "existing_thread",
//             call_to_actions: []
//         }

//     }, function (error, response, body) {
//         console.log(response)
//         if (error) {
//             console.log('Error sending messages: ', error)
//         } else if (response.body.error) {
//             console.log('Error: ', response.body.error)
//         }
//     })
// }
// removePersistentMenu()
addPersistentMenu()
