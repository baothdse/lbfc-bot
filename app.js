var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();

var port = process.env.PORT || 3000;

//morgan
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.listen(port);

app.get('/', function(req, res) {
    res.send('Facebook Chatbot Here'); 
});

app.get('/webhook', function(req, res) {
    if(req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
        console.log("Verified Webhook");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.log("Verification failed. The token do not match");
        res.sendStatus(403);
    }
});

app.post('/webhook', function(req, res) {
    if (req.body.object == "page") {
        req.body.entry.forEach(function(entry) {
            entry.messaging.forEach(function(event) {
                if (event.postback) {
                    console.log(event.postback + "baothd");
                    processPostback(event);
                }
            });
        });
        res.sendStatus(200);
    }
});

function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;

    if(payload == 'Greeting') {
        request({
            url : 'https://graph.facebook.com/v2.6/' + senderId,
            qs: {
                access_token: process.env.PAGE_ACCESS_TOKEN,
                fields: "first_name"
            },
            method: 'GET',
        }, function(error, response, body) {
            var greeting = "";
            if(error) {
                consonle.log("Error greeting user's name : " + error);
            } else {
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hi " + name + ".";
            }
            var message =  greeting + "Tui là bot được tạo ra bởi anh Bảo đẹp zai. Bạn cần tui giúp gì ko?";
            sendMessage(senderId, {text: message});
        })
    };
};

// sends message to user
function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}

console.log("Server start on port " + port);