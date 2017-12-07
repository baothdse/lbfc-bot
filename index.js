const express = require('express');
const bodyParser = require('body-parser');
const verificationController = require('./controllers/verification');
const redis = require('redis');

const Brain = require('./bot/ai/brain');
var request = require('request');
const FB_TOKEN = 'EAAGrlOZA1cX8BAPM7ij4396bh4ZC0EjY8bfnxosk589K6eBvPQZCtCCONzDSN3e3zgVHKyyVcZCv0of1pmaKvp3EIZC3Gm7aDSOWmglUIoofBFLoaNurG31TQZBm8xvKuL01kPPqz9k8AFDKa7DP2XUU6UYCxDhePkRZCtoTY8ZCSgZDZD';
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
                            "title": "Giỏ hàng của tôi",
                            "type": "postback",
                            "payload": "my cart"
                        },
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
