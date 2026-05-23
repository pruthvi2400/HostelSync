const express = require('express');
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (req.user.role === 'parent' && req.user.parentOf) query.student = req.user.parentOf;
    const leaves = await Leave.find(query)
      .populate('student', 'name rollNo room')
      .populate('approvedBy', 'name')
      .sort('-createdAt');
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const leave = await Leave.create({ ...req.body, student: req.user._id });
    await leave.populate('student', 'name rollNo');
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { ...req.body, approvedBy: req.user._id },
      { new: true }
    ).populate('student', 'name rollNo').populate('approvedBy', 'name');
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
