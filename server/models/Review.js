const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true }
);

// One review per user per destination
reviewSchema.index({ destination: 1, user: 1 }, { unique: true });

// Recalculate the average rating stored on the destination
reviewSchema.statics.recalc = async function (destinationId) {
  const id = new mongoose.Types.ObjectId(String(destinationId));
  const [stats] = await this.aggregate([
    { $match: { destination: id } },
    { $group: { _id: '$destination', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await mongoose.model('Destination').findByIdAndUpdate(id, {
    avgRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    numReviews: stats ? stats.count : 0,
  });
};

module.exports = mongoose.model('Review', reviewSchema);
