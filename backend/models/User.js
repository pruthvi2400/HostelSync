const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'warden', 'parent'], default: 'student' },
  rollNo: String,
  phone: String,
  address: String,
  emergencyContact: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  parentOf: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
