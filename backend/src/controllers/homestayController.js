const Homestay = require('../models/Homestay');

const createHomestay = async (req, res) => {
    try {
        const { title, description, location, pricePerNight, amenities, hostContact } = req.body;

        const homestayData = {
            host: req.user._id,
            title,
            description,
            location,
            pricePerNight,
            amenities,
            hostContact
        };

        if (req.file) {
            homestayData.propertyCoverPhoto = req.file.path;
        }

        const homestay = await Homestay.create(homestayData);
        res.status(201).json(homestay);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getHomestays = async (req, res) => {
    try {
        const homestays = await Homestay.find({}).populate('host', 'name email');
        res.json(homestays);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getHomestayById = async (req, res) => {
    try {
        const homestay = await Homestay.findById(req.params.id).populate('host', 'name email');
        if (homestay) {
            res.json(homestay);
        } else {
            res.status(404).json({ message: 'Homestay not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateHomestay = async (req, res) => {
    try {
        const homestay = await Homestay.findById(req.params.id);

        if (!homestay) {
            return res.status(404).json({ message: 'Homestay not found' });
        }

        if (homestay.host.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (req.body.title) homestay.title = req.body.title;
        if (req.body.description) homestay.description = req.body.description;
        if (req.body.location) homestay.location = req.body.location;
        if (req.body.pricePerNight) homestay.pricePerNight = req.body.pricePerNight;
        if (req.body.amenities) homestay.amenities = req.body.amenities;
        if (req.body.hostContact) homestay.hostContact = req.body.hostContact;

        if (req.file) {
            homestay.propertyCoverPhoto = req.file.path;
        }

        const updatedHomestay = await homestay.save();
        res.json(updatedHomestay);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteHomestay = async (req, res) => {
    try {
        const homestay = await Homestay.findById(req.params.id);

        if (!homestay) {
            return res.status(404).json({ message: 'Homestay not found' });
        }

        if (homestay.host.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await homestay.deleteOne();
        res.json({ message: 'Homestay removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createHomestay,
    getHomestays,
    getHomestayById,
    updateHomestay,
    deleteHomestay
};
