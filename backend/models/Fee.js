const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['hostel', 'mess', 'security', 'other'], default: 'hostel' },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  month: String,
  dueDate: Date,
  paidDate: Date,
  transactionId: String,
  remarks: String,
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
