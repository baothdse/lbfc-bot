var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var log = require('simple-node-logger').createSimpleLogger('project.log');

var app = express();
var apiaiApp = require('apiai')('fa60b3a3247e42c3a9bf870dcd78a7a3');
var port = process.env.PORT || 3000;

var bot = require("./fb_bot/bot");

//morgan
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.listen(port);

app.get('/', function (req, res) {
    res.send('LBFC Chatbot Here');
});

app.get('/webhook', function (req, res) {
    if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
        console.log("Verified Webhook");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.log("Verification failed. The token do not match");
        res.sendStatus(403);
    }
});

app.post('/webhook', function (req, res) {
    var entries = req.body.entry;
    for (var entry of entries) {
        log.info(entries)
        var messaging = entry.messaging;
        for (var message of messaging) {
            var senderId = message.sender.id;
            if (message.message) {
                //if user send text
                if (message.message.text) {
                    console.log('Here you are')
                    bot.reply(senderId, message.message.text)
                }
            } else if (message.postback) {
                var payload = message.postback.payload;
            }
        }
    }
    res.status(200).send("OK");
});

console.log('Server start on port: ' + port)


// function processPostback(event) {
//     var senderId = event.sender.id;
//     var payload = event.postback.payload;

//     if (payload == 'Greeting') {
//         request({
//             url: 'https://graph.facebook.com/v2.6/' + senderId,
//             qs: {
//                 access_token: process.env.PAGE_ACCESS_TOKEN,
//                 fields: "first_name"
//             },
//             method: 'GET',
//         }, function (error, response, body) {
//             var greeting = "";
//             if (error) {
//                 consonle.log("Error greeting user's name : " + error);
//             } else {
//                 var bodyObj = JSON.parse(body);
//                 name = bodyObj.first_name;
//                 greeting = "Hi " + name + ".";
//             }
//             var message = greeting + "Tui là bot được tạo ra bởi anh Bảo đẹp zai. Bạn cần tui giúp gì ko?";
//             sendMessage(senderId, { text: message });
//         })
//     };
// };

// function processMessage(event) {
//     if (!event.message.is_echo) {
//         var message = event.message;
//         var senderId = event.sender.id;

//         console.log("Message receive from sender Id:" + senderId);
//         console.log("Message is: " + JSON.stringify(message));

//         if (message.text) {
//             var formattedMsg = message.text.toLowerCase().trim();
//             if (formattedMsg == "hi") {
//                 sendMessage(senderId, { text: "Bạn muốn tìm hiểu cửa hàng gì?" });
//             } else {
//                 sendMessage(senderId, { text: "Xin lỗi tôi chưa thể hiểu bạn nói gì." });
//             }
//         }
//     }
// };

function addPersistentMenu() {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: { access_token: process.env.FB_TOKEN },
        method: 'POST',
        json: {
            "get_started": {
                "payload": "GET_STARTED_PAYLOAD"
            }
        }
    }, function (error, response, body) {
        console.log("Add persistent menu " + response)
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
    request({
        url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
        qs: { access_token: process.env.FB_TOKEN },
        method: 'POST',
        json: {
            "persistent_menu": [
                {
                    "locale": "default",
                    "composer_input_disabled": true,
                    "call_to_actions": [
                        {
                            "title": "Trang chủ",
                            "type": "web_url",
                            "payload": "http://google.com"
                        },
                        {
                            "title": "Về chúng tôi",
                            "type": "nested",
                            "call_to_actions": [
                                {
                                    "title": "LBFC",
                                    "type": "postback",
                                    "payload": "WHO"
                                },
                                {
                                    "title": "Joke",
                                    "type": "postback",
                                    "payload": "joke"
                                },
                                {
                                    "title": "Contact Info",
                                    "type": "postback",
                                    "payload": "CONTACT"
                                }
                            ]
                        },
                        {
                            "type": "web_url",
                            "title": "Menu",
                            "url": "http://foxnews.com",
                            "webview_height_ratio": "full"
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
        console.log(response)
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
