const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    providerName: {
        type: String,
        required: [true, 'Please add a provider name']
    },
    duration: {
        type: Number,
        required: [true, 'Please add duration in hours']
    },
    pricePerPerson: {
        type: Number,
        required: [true, 'Please add price per person']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    actionShot: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
