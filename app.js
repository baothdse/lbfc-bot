var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();
var apiaiApp = require('apiai')('fa60b3a3247e42c3a9bf870dcd78a7a3');
var port = process.env.PORT || 3000;

// //mongooge
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/LBFC');

// mongoose.connection.on('connected',function(){
//     console.log('mongoose connected');
// });

// var Restaurant = require('./model/restaurant.js');
//morgan
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.listen(port);

app.get('/', function (req, res) {
    res.send('Facebook Chatbot Here');
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
    if (req.body.object == "page") {
        req.body.entry.forEach(function (entry) {
            entry.messaging.forEach(function (event) {
                // if (event.postback) {
                //     console.log(event.postback);
                //     processPostback(event);
                // } else
                if (event.message) {
                    sendMessage(event);
                }
            });
        });
        res.sendStatus(200);
    }
});


// sends message to user
function sendMessage(event) {

    let text = event.message.text;
    let sender = event.sender.id;

    let apiai = apiaiApp.textRequest(text, {
        sessionId: "my_session"
    });

    apiai.on('response', (response) => {
        console.log("API.AI is on response state");
        let aiText = response.result.fulfillment.speech;
        request({
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
            method: "POST",
            json: {
                recipient: { id: sender },
                message: {text: aiText}
            }
        }, function (error, response, body) {
            if (error) {
                console.log("Error sending message: " + response.error);
            }
        });
    });

    apiai.on('error', (error) => {
        console.log(error);
    });

    apiai.end();
};

// function getMenu() {
//     Restaurant.findOne(function(err, restaurant) {
//         console.log(restaurant.menu);
//         return restaurant.menu;
//     })
//  }
// var menu = getMenu();
console.log("Server start on port " + port);
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