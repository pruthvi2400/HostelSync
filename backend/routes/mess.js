const express = require('express');
const MessMenu = require('../models/MessMenu');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const menu = await MessMenu.find().sort('weekNumber');
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const menu = await MessMenu.create(req.body);
    res.status(201).json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    const menu = await MessMenu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorize('admin', 'warden'), async (req, res) => {
  try {
    await MessMenu.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
