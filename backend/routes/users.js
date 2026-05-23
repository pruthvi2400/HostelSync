const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('room', 'roomNumber floor');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/students', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').populate('room', 'roomNumber floor');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, address, emergencyContact } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, emergencyContact },
      { new: true }
    ).select('-password').populate('room');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
