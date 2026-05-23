const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  breakfast: String,
  lunch: String,
  snacks: String,
  dinner: String,
  weekNumber: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('MessMenu', messMenuSchema);
