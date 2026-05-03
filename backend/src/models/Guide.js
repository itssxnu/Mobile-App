const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    languagesSpoken: {
        type: String,
        required: [true, 'Please add languages spoken']
    },
    vehicleType: {
        type: String,
        required: [true, 'Please add a vehicle type']
    },
    dailyRate: {
        type: Number,
        required: [true, 'Please add a daily rate']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    profileHeadshot: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Guide', guideSchema);
