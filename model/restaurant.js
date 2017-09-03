var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var restaurantSchema = new Schema({
    restaurant_name : String,
    address: String, 
    menu: String
});

module.exports =  mongoose.model('Restaurant', restaurantSchema, 'Restaurant');