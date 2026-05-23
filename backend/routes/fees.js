const express = require('express');
const Fee = require('../models/Fee');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (req.user.role === 'parent' && req.user.parentOf) query.student = req.user.parentOf;
    const fees = await Fee.find(query)
      .populate('student', 'name rollNo')
      .sort('-createdAt');
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    await fee.populate('student', 'name rollNo');
    res.status(201).json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'name rollNo');
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
