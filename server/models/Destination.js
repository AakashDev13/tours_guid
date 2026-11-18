const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    tip: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    city: { type: String, required: [true, 'City is required'], trim: true },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    category: {
      type: String,
      enum: ['beach', 'mountain', 'city', 'heritage', 'adventure', 'nature'],
      required: [true, 'Category is required'],
    },
    budget: { type: String, enum: ['budget', 'mid', 'luxury'], default: 'mid' },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    image: { type: String, trim: true, default: '' },
    bestTime: { type: String, trim: true, default: '' },
    attractions: [attractionSchema],
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

destinationSchema.index({ name: 'text', city: 'text', country: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);
