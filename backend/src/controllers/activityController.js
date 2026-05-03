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
            activityData.actionShot = req.file.path;
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

const getActivityById = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id).populate('host', 'name email');
        if (activity) {
            res.json(activity);
        } else {
            res.status(404).json({ message: 'Activity not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.host.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        activity.pricePerPerson = req.body.pricePerPerson || activity.pricePerPerson;
        activity.duration = req.body.duration || activity.duration;

        if(req.body.title) activity.title = req.body.title;
        if(req.body.category) activity.category = req.body.category;

        if (req.file) {
            activity.actionShot = req.file.path;
        }

        const updatedActivity = await activity.save();
        res.json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.host.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await activity.deleteOne();
        res.json({ message: 'Activity removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createActivity,
    getActivities,
    getActivityById,
    updateActivity,
    deleteActivity
};
