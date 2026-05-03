const Review = require('../models/Review');

const createReview = async (req, res) => {
    try {
        const { targetId, targetType, rating, comment } = req.body;

        if (req.user.role?.toUpperCase() !== 'USER') {
            return res.status(403).json({ message: 'Only standard users can write reviews' });
        }

        const reviewData = {
            author: req.user._id,
            targetId,
            targetType,
            rating,
            comment
        };

        if (req.file) {
            reviewData.reviewPhoto = req.file.path;
        }

        const review = await Review.create(reviewData);
        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getReviewsByTarget = async (req, res) => {
    try {
        const { targetId } = req.params;
        const reviews = await Review.find({ targetId }).populate('author', 'name email');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (req.body.rating) review.rating = req.body.rating;
        if (req.body.comment) review.comment = req.body.comment;

        if (req.file) {
            review.reviewPhoto = req.file.path;
        }

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const isAuthor = review.author && review.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role?.toUpperCase() === 'ADMIN';

        let isItemOwner = false;
        if (!isAuthor && !isAdmin && req.user.role?.toUpperCase() === 'PROVIDER') {
            let TargetModel;
            switch(review.targetType) {
                case 'Activity': TargetModel = require('../models/Activity'); break;
                case 'Attraction': TargetModel = require('../models/Attraction'); break;
                case 'Guide': TargetModel = require('../models/Guide'); break;
                case 'Homestay': TargetModel = require('../models/Homestay'); break;
                case 'Event': TargetModel = require('../models/Event'); break;
            }
            if (TargetModel) {
                const targetItem = await TargetModel.findById(review.targetId);
                if (targetItem && targetItem.host && targetItem.host.toString() === req.user._id.toString()) {
                    isItemOwner = true;
                }
            }
        }

        if (!isAuthor && !isAdmin && !isItemOwner) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await review.deleteOne();
        res.json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createReview,
    getReviewsByTarget,
    updateReview,
    deleteReview
};
