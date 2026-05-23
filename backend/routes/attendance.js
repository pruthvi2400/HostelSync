const express = require('express');
const Attendance = require('../models/Attendance');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (req.user.role === 'parent' && req.user.parentOf) query.student = req.user.parentOf;
    const attendance = await Attendance.find(query)
      .populate('student', 'name rollNo')
      .populate('markedBy', 'name')
      .sort('-date');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const { records } = req.body;
    const attendance = await Attendance.insertMany(
      records.map(r => ({ ...r, markedBy: req.user._id }))
    );
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/single', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const record = await Attendance.create({ ...req.body, markedBy: req.user._id });
    await record.populate('student', 'name rollNo');
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
