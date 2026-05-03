const Guide = require('../models/Guide');

const createGuide = async (req, res) => {
    try {
        const { name, languagesSpoken, vehicleType, dailyRate, phoneNumber } = req.body;

        const guideData = {
            host: req.user._id,
            name,
            languagesSpoken,
            vehicleType,
            dailyRate,
            phoneNumber
        };

        if (req.file) {
            guideData.profileHeadshot = req.file.path;
        }

        const guide = await Guide.create(guideData);
        res.status(201).json(guide);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getGuides = async (req, res) => {
    try {
        const guides = await Guide.find({}).populate('host', 'name email');
        res.json(guides);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getGuideById = async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id).populate('host', 'name email');
        if (guide) {
            res.json(guide);
        } else {
            res.status(404).json({ message: 'Guide not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateGuide = async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);

        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        if (guide.host.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (req.body.dailyRate) guide.dailyRate = req.body.dailyRate;
        if (req.body.phoneNumber) guide.phoneNumber = req.body.phoneNumber;
        if (req.body.name) guide.name = req.body.name;
        if (req.body.languagesSpoken) guide.languagesSpoken = req.body.languagesSpoken;
        if (req.body.vehicleType) guide.vehicleType = req.body.vehicleType;

        if (req.file) {
            guide.profileHeadshot = req.file.path;
        }

        const updatedGuide = await guide.save();
        res.json(updatedGuide);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteGuide = async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);

        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        if (guide.host.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await guide.deleteOne();
        res.json({ message: 'Guide removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createGuide,
    getGuides,
    getGuideById,
    updateGuide,
    deleteGuide
};
