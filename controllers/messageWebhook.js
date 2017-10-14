const processMessage = require('../helpers/processMessage');
let Brain = require('../bot/ai/brain');



module.exports = (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && event.message.text) {
                    Brain.response(event);
                    
                }
            });
        });

        res.status(200).end();
    }
};