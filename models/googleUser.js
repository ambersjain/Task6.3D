const mongoose = require("mongoose");
const validator = require('validator');
const passportLocalMongoose = require('passport-local-mongoose');

// User schema

//Defining the schema
const userSchema = mongoose.Schema({
    country: {
        type: String,
        minlength: 1,
        maxlength: 50
    },
    first_name: {
        type: String,
        minlength: 1,
        maxlength: 50
    },
    last_name: {
        type: String,
        minlength: 1,
        maxlength: 50
    },
    password: {
        type: String,
        minlength: 8,
    },
    address: {
        type: String,
        minlength: 2,
        maxlength: 1000
    },
    city: {
        type: String,
        minlength: 1,
        maxlength: 50
    },
    state: {
        type: String,
        minlength: 1,
        maxlength: 1000
    },
    zip: {
        type: String,
    },
    mobile_number: {
        type: String,
        validate(value) {
            if (!validator.isMobilePhone(value) && value != '') {
                throw new Error('Mobile number is not valid');
            }
        }
    },
    username: String,
    googleId: String,
    email: String,
  }
)

//plugin
userSchema.plugin(passportLocalMongoose);

//Defining a model
module.exports = mongoose.model('googleUser', userSchema)
