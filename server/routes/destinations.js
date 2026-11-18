const express = require('express');
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const reviewRoutes = require('./reviews');

const router = express.Router();

// Nested reviews: /api/destinations/:destinationId/reviews
router.use('/:destinationId/reviews', reviewRoutes);

const EDITABLE = ['name', 'city', 'country', 'category', 'budget', 'description', 'image', 'bestTime', 'attractions'];
const pick = (obj) =>
  EDITABLE.reduce((acc, key) => (obj[key] !== undefined ? { ...acc, [key]: obj[key] } : acc), {});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  rating: { avgRating: -1, numReviews: -1 },
  newest: { createdAt: -1 },
  name: { name: 1 },
};

// GET /api/destinations?q=&category=&budget=&sort=&page=&limit=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, budget, sort = 'rating' } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 50);

    const filter = {};
    if (q && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [{ name: rx }, { city: rx }, { country: rx }];
    }
    if (category) filter.category = category;
    if (budget) filter.budget = budget;

    const [data, total] = await Promise.all([
      Destination.find(filter)
        .sort(SORTS[sort] || SORTS.rating)
        .skip((page - 1) * limit)
        .limit(limit),
      Destination.countDocuments(filter),
    ]);

    res.json({ data, page, pages: Math.max(Math.ceil(total / limit), 1), total });
  })
);

// GET /api/destinations/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid destination id' });
    }
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Destination not found' });
    res.json({ data: destination });
  })
);

// POST /api/destinations  (admin)
router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const destination = await Destination.create({ ...pick(req.body), createdBy: req.user._id });
    res.status(201).json({ data: destination });
  })
);

// PUT /api/destinations/:id  (admin)
router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Destination not found' });
    destination.set(pick(req.body));
    await destination.save();
    res.json({ data: destination });
  })
);

// DELETE /api/destinations/:id  (admin)
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: 'Destination not found' });

    await Promise.all([
      Review.deleteMany({ destination: destination._id }),
      User.updateMany({}, { $pull: { favorites: destination._id } }),
      destination.deleteOne(),
    ]);
    res.json({ message: 'Destination deleted' });
  })
);

module.exports = router;
