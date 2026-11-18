const express = require('express');
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/favorites  -> the user's saved destinations
router.get(
  '/favorites',
  protect,
  asyncHandler(async (req, res) => {
    await req.user.populate('favorites');
    res.json({ data: req.user.favorites });
  })
);

// POST /api/users/favorites/:destinationId  -> add or remove (toggle)
router.post(
  '/favorites/:destinationId',
  protect,
  asyncHandler(async (req, res) => {
    const { destinationId } = req.params;
    if (!mongoose.isValidObjectId(destinationId)) {
      return res.status(400).json({ message: 'Invalid destination id' });
    }
    if (!(await Destination.exists({ _id: destinationId }))) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const already = req.user.favorites.some((id) => String(id) === destinationId);
    if (already) req.user.favorites.pull(destinationId);
    else req.user.favorites.push(destinationId);
    await req.user.save();

    res.json({ favorites: req.user.favorites.map(String), saved: !already });
  })
);

module.exports = router;
