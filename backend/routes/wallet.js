const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Get wallet info
router.get('/:licensePlate', async (req, res) => {
  try {
    console.log('Getting wallet info for:', req.params.licensePlate);
    const user = await User.findOne({ licensePlate: req.params.licensePlate }).populate('transactions');
    if (!user) {
      console.log('User not found:', req.params.licensePlate);
      return res.status(400).json({ error: 'User not found' });
    }
    console.log('Wallet balance:', user.wallet);
    res.json({ 
      success: true,
      wallet: user.wallet, 
      transactions: user.transactions.slice(-5).reverse() 
    });
  } catch (error) {
    console.error('Error getting wallet info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add money (mock payment)
router.post('/add', async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();
  
  try {
    const { licensePlate, amount, method } = req.body;
    console.log('Adding money request:', { licensePlate, amount, method });

    // Input validation
    if (!licensePlate || !amount || amount <= 0) {
      console.log('Invalid input:', { licensePlate, amount });
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Find user with session
    const user = await User.findOne({ licensePlate }).session(session);
    if (!user) {
      console.log('User not found:', licensePlate);
      return res.status(400).json({ error: 'User not found' });
    }

    console.log('Current wallet balance:', user.wallet);
    const oldBalance = user.wallet;
    const amountToAdd = Number(amount);

    // Create transaction first
    const transaction = new Transaction({
      user: user._id,
      amount: amountToAdd,
      type: 'add',
      method: method || 'manual'
    });

    // Save transaction with session
    const savedTransaction = await transaction.save({ session });
    console.log('Transaction saved:', savedTransaction._id);

    // Update user's wallet and transactions
    user.wallet = oldBalance + amountToAdd;
    user.transactions.push(savedTransaction._id);
    
    // Save user with session
    const savedUser = await user.save({ session });
    console.log('User saved with new balance:', savedUser.wallet);

    // Commit transaction
    await session.commitTransaction();
    console.log('Transaction committed successfully');

    res.json({ 
      success: true,
      wallet: savedUser.wallet,
      oldBalance: oldBalance,
      addedAmount: amountToAdd,
      transactionId: savedTransaction._id
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Error adding money:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  } finally {
    session.endSession();
  }
});

// Get all transactions for a user
router.get('/transactions/:licensePlate', async (req, res) => {
  try {
    const user = await User.findOne({ licensePlate: req.params.licensePlate });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const transactions = await Transaction.find({ user: user._id })
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      transactions: transactions.map(t => t.getDetails())
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 