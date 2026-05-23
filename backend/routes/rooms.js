const express = require('express');
const Room = require('../models/Room');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants', 'name rollNo email');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/allocate', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.occupants.length >= room.capacity)
      return res.status(400).json({ message: 'Room is at full capacity' });
    if (room.occupants.includes(studentId))
      return res.status(400).json({ message: 'Student already in this room' });

    room.occupants.push(studentId);
    if (room.occupants.length >= room.capacity) room.status = 'occupied';
    await room.save();
    await User.findByIdAndUpdate(studentId, { room: room._id });
    await room.populate('occupants', 'name rollNo email');
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/deallocate', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const room = await Room.findById(req.params.id);
    room.occupants = room.occupants.filter(id => id.toString() !== studentId);
    if (room.occupants.length < room.capacity) room.status = 'available';
    await room.save();
    await User.findByIdAndUpdate(studentId, { room: null });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
