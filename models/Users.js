const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
       type: String,
       required: true 
    },
    password: {
        type: String,
        required: true
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    organizationName: {
        type: String,
        required: true
    }
    
});

const User = mongoose.model('User', UserSchema);

module.exports = User;