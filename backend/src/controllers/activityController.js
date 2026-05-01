const Activity = require('../models/Activity');

const createActivity = async (req, res) => {
    try {
        const { title, providerName, duration, pricePerPerson, category } = req.body;

        const activityData = {
            host: req.user._id,
            title,
            providerName,
            duration,
            pricePerPerson,
            category
        };

        if (req.file) {
            activityData.actionShot = `/uploads/activities/${req.file.filename}`;
        }

        const activity = await Activity.create(activityData);
        res.status(201).json(activity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find({}).populate('host', 'name email');
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

