const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, default: 1 },
  type: { type: String, enum: ['single', 'double', 'triple'], default: 'double' },
  capacity: { type: Number, default: 2 },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  amenities: [String],
  monthlyFee: { type: Number, default: 5000 },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
