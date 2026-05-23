const express = require('express');
const Complaint = require('../models/Complaint');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'student' ? { student: req.user._id } : {};
    const complaints = await Complaint.find(query)
      .populate('student', 'name rollNo room')
      .populate('assignedTo', 'name')
      .sort('-createdAt');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const complaint = await Complaint.create({ ...req.body, student: req.user._id });
    await complaint.populate('student', 'name rollNo');
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'name rollNo')
      .populate('assignedTo', 'name');
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
