const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    location: {
       type: {
        type: String,
        enum: ['Point']
       },
       coordinates: {
        type: [Number],
        index: '2dsphere'
       }
    },
    codeNum: {
        type: Number,
    },
    locationName: {
        type: String,
    },
    lat: {
        type: Number,
    },
    lon: {
        type: Number,
    },
    postcode: {
        type: String,
    },
    type: {
        type: String,
    },
    number: {
        type: String,
    },
    websiteURL: {
        type: String,
    },
    served: {
        type: String,
    },
    SubmittedBy: {
        type: String,
    },
    descriptionBox: {
        type: String,
    },
    commentsList: [{
        CommentText: { type: String },
        DateOfComment: { type: Date }
    }],
    likes: [
    ],
    dislikes: [
    ],
  
    
});

const locations = mongoose.model('points', locationSchema);

module.exports = locations;