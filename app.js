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
        console.log(process.env.VERIFICATION_TOKEN);
        console.log("Verified Webhook");
        res.status(200).send(req.query["hub-challenge"]);
    } else {
        console.log("Verification failed. The token do not match");
        res.sendStatus(403);
    }
});

console.log("Server start on port " + port);