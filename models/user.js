const mongoose = require("mongoose");
const validator = require('validator');

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
    email: {
        type: String,
        minlength: 1,
        maxlength: 255,
        trim:true,
        lowercase:true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid');
            }
        }
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
        required: false,
    },
    mobile_number: {
        type: String,
        required: false,
        validate(value) {
            if (!validator.isMobilePhone(value) && value != '') {
                throw new Error('Mobile number is not valid');
            }
        }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    username: String,
    googleId: String
  }
)

//Defining a model
//module.exports = mongoose.model('User', userSchema)
module.exports = mongoose.model('Users', userSchema);
