var mongoose = require('mongoose');
var schema = mongoose.Schema;

var restaurantSchema = new Schema({
    id: Number,
    restaurant_name : String,
    address: String, 
    menu: [menu]
});

var Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;