const express = require('express');
const bodyParser = require('body-parser');
const verificationController = require('./controllers/verification');
const messageWebhookController = require('./controllers/messageWebhook');
const Brain = require('./bot/ai/brain');


const app = express();
var brain = new Brain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post('/', brain.receive.bind(brain));
app.get('/', verificationController);

app.listen(5000, () => console.log("Webhook server start at 5000"));