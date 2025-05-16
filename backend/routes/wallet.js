const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Get wallet info
router.get('/:licensePlate', async (req, res) => {
  const user = await User.findOne({ licensePlate: req.params.licensePlate }).populate('transactions');
  if (!user) return res.status(400).json({ error: 'User not found' });
  res.json({ wallet: user.wallet, transactions: user.transactions.slice(-5).reverse() });
});

// Add money (mock payment)
router.post('/add', async (req, res) => {
  const { licensePlate, amount, method } = req.body;
  const user = await User.findOne({ licensePlate });
  if (!user) return res.status(400).json({ error: 'User not found' });
  user.wallet += amount;
  await user.save();

  const txn = await Transaction.create({
    user: user._id,
    amount,
    type: 'add',
    method
  });
  user.transactions.push(txn._id);
  await user.save();

  res.json({ wallet: user.wallet });
});

module.exports = router; 