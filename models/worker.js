const mongoose = require("mongoose");
const validator = require('validator');

const workerSchema = mongoose.Schema({
    id: {
        type: Number,
        minlength: 1,
        maxlength: 50
    },
    name: {
        type: String,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        minlength: 1,
        maxlength: 255,
        unique: true,
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
    mobile_number: {
        type: String,
        validate(value) {
            if (!validator.isMobilePhone(value) && value != '') {
                throw new Error('Mobile number is not valid');
            }
        }
    },
  });


//Defining the model
const Worker = mongoose.model('Worker', workerSchema);
exports.Worker = Worker;