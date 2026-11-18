const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Destination = require('../models/Destination');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');

// Mounted at /api/destinations/:destinationId/reviews
const router = express.Router({ mergeParams: true });

const validId = (id) => mongoose.isValidObjectId(id);

// GET all reviews for a destination
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { destinationId } = req.params;
    if (!validId(destinationId)) return res.status(400).json({ message: 'Invalid destination id' });
    const reviews = await Review.find({ destination: destinationId })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json({ data: reviews });
  })
);

// POST create or update the logged-in user's review
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { destinationId } = req.params;
    if (!validId(destinationId)) return res.status(400).json({ message: 'Invalid destination id' });
    if (!(await Destination.exists({ _id: destinationId }))) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }

    const review = await Review.findOneAndUpdate(
      { destination: destinationId, user: req.user._id },
      { rating, comment: req.body.comment || '' },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await Review.recalc(destinationId);
    await review.populate('user', 'name');
    res.status(201).json({ data: review });
  })
);

// DELETE a review (owner or admin)
router.delete(
  '/:reviewId',
  protect,
  asyncHandler(async (req, res) => {
    const { destinationId, reviewId } = req.params;
    if (!validId(reviewId)) return res.status(400).json({ message: 'Invalid review id' });

    const review = await Review.findOne({ _id: reviewId, destination: destinationId });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isOwner = String(review.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own review' });
    }

    await review.deleteOne();
    await Review.recalc(destinationId);
    res.json({ message: 'Review deleted' });
  })
);

module.exports = router;
