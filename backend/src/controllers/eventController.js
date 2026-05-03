const Event = require('../models/Event');

const createEvent = async (req, res) => {
    try {
        const { eventName, eventDate, location, description } = req.body;

        const eventData = {
            host: req.user._id,
            eventName,
            eventDate,
            location,
            description
        };

        if (req.file) {
            eventData.eventPoster = req.file.path;
        }

        const event = await Event.create(eventData);
        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.find({}).sort({ eventDate: 1 }).populate('host', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('host', 'name email');
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.host.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (req.body.eventName) event.eventName = req.body.eventName;
        if (req.body.eventDate) event.eventDate = req.body.eventDate;
        if (req.body.location) event.location = req.body.location;
        if (req.body.description) event.description = req.body.description;

        if (req.file) {
            event.eventPoster = req.file.path;
        }

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.host.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent
};
