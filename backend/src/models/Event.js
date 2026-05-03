const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    eventName: {
        type: String,
        required: [true, 'Please add an event name']
    },
    eventDate: {
        type: Date,
        required: [true, 'Please add an event date']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    eventPoster: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
