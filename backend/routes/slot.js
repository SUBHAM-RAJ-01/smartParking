const express = require('express');
const Slot = require('../models/Slot');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Initialize 8 slots if not present
Slot.countDocuments().then(count => {
  if (count === 0) {
    for (let i = 1; i <= 8; i++) {
      Slot.create({ slotNumber: i });
    }
  }
});

// Get all slots
router.get('/', async (req, res) => {
  const slots = await Slot.find();
  res.json(slots);
});

// Reserve a slot
router.post('/reserve', async (req, res) => {
  const { licensePlate } = req.body;
  const user = await User.findOne({ licensePlate });
  if (!user) return res.status(400).json({ error: 'User not found' });

  // Find first available slot
  const slot = await Slot.findOne({ occupied: false });
  if (!slot) return res.status(400).json({ error: 'No slots available' });

  // Mark slot as occupied
  slot.occupied = true;
  slot.vehicle = licensePlate;
  slot.entryTime = new Date();
  await slot.save();

  res.json({ slotNumber: slot.slotNumber });
});

// Release a slot (exit)
router.post('/release', async (req, res) => {
  const { licensePlate } = req.body;
  const slot = await Slot.findOne({ vehicle: licensePlate, occupied: true });
  if (!slot) return res.status(400).json({ error: 'Slot not found' });

  // Calculate charges
  const entry = slot.entryTime;
  const now = new Date();
  const duration = Math.ceil((now - entry) / (1000 * 60 * 15)); // 15 min blocks
  const base = 10;
  const charge = base + (duration * 5);

  // Deduct from wallet
  const user = await User.findOne({ licensePlate });
  if (user.wallet < charge) return res.status(400).json({ error: 'Insufficient balance' });
  user.wallet -= charge;
  await user.save();

  // Log transaction
  const txn = await Transaction.create({
    user: user._id,
    amount: charge,
    type: 'deduct',
    method: 'Parking'
  });
  user.transactions.push(txn._id);
  await user.save();

  // Release slot
  slot.occupied = false;
  slot.vehicle = null;
  slot.entryTime = null;
  await slot.save();

  res.json({ charge });
});

// Admin: force release
router.post('/admin/force-release', async (req, res) => {
  const { slotNumber } = req.body;
  const slot = await Slot.findOne({ slotNumber });
  if (!slot) return res.status(400).json({ error: 'Slot not found' });
  slot.occupied = false;
  slot.vehicle = null;
  slot.entryTime = null;
  await slot.save();
  res.json({ success: true });
});

// Admin: manual assign
router.post('/admin/assign', async (req, res) => {
  const { slotNumber, licensePlate } = req.body;
  const slot = await Slot.findOne({ slotNumber });
  if (!slot) return res.status(400).json({ error: 'Slot not found' });
  slot.occupied = true;
  slot.vehicle = licensePlate;
  slot.entryTime = new Date();
  await slot.save();
  res.json({ success: true });
});

module.exports = router; 