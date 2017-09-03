var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var restaurantSchema = new Schema({
    id: Number,
    restaurant_name : String,
    address: String, 
    menu: String
});

var Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;