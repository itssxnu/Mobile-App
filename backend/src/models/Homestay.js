const mongoose = require('mongoose');

const homestaySchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Please add a price per night']
    },
    amenities: {
        type: String,
        required: [true, 'Please add amenities']
    },
    hostContact: {
        type: String,
        required: [true, 'Please add host contact info']
    },
    propertyCoverPhoto: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Homestay', homestaySchema);
