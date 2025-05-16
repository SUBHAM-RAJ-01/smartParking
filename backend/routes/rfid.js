const express = require('express');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Transaction = require('../models/Transaction');
const router = express.Router();

// RFID Entry endpoint
router.post('/entry', async (req, res) => {
  try {
    const { rfid } = req.body;
    
    // Find user by RFID tag
    const user = await User.findOne({ rfidTag: rfid });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Invalid RFID tag.' 
      });
    }
    
    // Check if any slot is available
    const slot = await Slot.findOne({ occupied: false });
    if (!slot) {
      return res.status(400).json({
        success: false,
        message: 'No parking slots available'
      });
    }
    
    // Assign slot to user
    slot.occupied = true;
    slot.vehicle = user.licensePlate;
    slot.entryTime = new Date();
    await slot.save();
    
    // Return success response
    return res.status(200).json({
      success: true,
      userName: user.name,
      slotNumber: slot.slotNumber
    });
  } catch (error) {
    console.error('Error processing entry:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing entry request'
    });
  }
});

// RFID Exit endpoint
router.post('/exit', async (req, res) => {
  try {
    const { rfid } = req.body;
    
    // Find user by RFID tag
    const user = await User.findOne({ rfidTag: rfid });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Invalid RFID tag.' 
      });
    }
    
    // Find slot by vehicle license plate
    const slot = await Slot.findOne({ vehicle: user.licensePlate });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'No active parking session found'
      });
    }
    
    // Calculate parking duration and fee
    const exitTime = new Date();
    const entryTime = new Date(slot.entryTime);
    const durationMs = exitTime - entryTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Calculate fee (e.g., $2 per hour, rounded up to nearest hour)
    const hourlyRate = 2;
    const hoursRoundedUp = Math.ceil(durationHours);
    const parkingFee = hoursRoundedUp * hourlyRate;
    
    // Format duration for display
    let parkingDuration = '';
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    parkingDuration = `${hours}h ${minutes}m`;
    
    // Check if user has enough balance
    let paymentStatus = 'UNPAID';
    if (user.wallet >= parkingFee) {
      // Deduct from wallet
      user.wallet -= parkingFee;
      
      // Create transaction record
      const transaction = new Transaction({
        user: user._id,
        amount: -parkingFee,
        type: 'parking',
        method: 'wallet'
      });
      await transaction.save();
      
      // Add transaction to user's transaction list
      user.transactions.push(transaction._id);
      await user.save();
      
      paymentStatus = 'WALLET';
      
      // Free up the slot
      slot.occupied = false;
      slot.vehicle = null;
      slot.entryTime = null;
      await slot.save();
    }
    
    // Return the response
    return res.status(200).json({
      success: true,
      userName: user.name,
      parkingFee,
      parkingDuration,
      paymentStatus,
      walletBalance: user.wallet
    });
  } catch (error) {
    console.error('Error processing exit:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing exit request'
    });
  }
});

// Payment status check endpoint
router.get('/payment-status/:rfid', async (req, res) => {
  try {
    const { rfid } = req.params;
    
    // Find user by RFID tag
    const user = await User.findOne({ rfidTag: rfid });
    if (!user) {
      return res.status(404).json({ paid: false });
    }
    
    // Find slot by vehicle license plate
    const slot = await Slot.findOne({ vehicle: user.licensePlate });
    
    // If no slot is found or the slot is no longer occupied, payment is complete
    if (!slot || !slot.occupied) {
      return res.status(200).json({ paid: true });
    }
    
    return res.status(200).json({ paid: false });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({ paid: false });
  }
});

// Add funds to wallet for testing
router.post('/add-funds', async (req, res) => {
  try {
    const { rfid, amount } = req.body;
    
    if (!rfid || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RFID or amount'
      });
    }
    
    // Find user by RFID tag
    const user = await User.findOne({ rfidTag: rfid });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Invalid RFID tag.' 
      });
    }
    
    // Add funds to wallet
    user.wallet += amount;
    
    // Create transaction record
    const transaction = new Transaction({
      user: user._id,
      amount,
      type: 'deposit',
      method: 'manual'
    });
    await transaction.save();
    
    // Add transaction to user's transaction list
    user.transactions.push(transaction._id);
    await user.save();
    
    return res.status(200).json({
      success: true,
      walletBalance: user.wallet
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding funds'
    });
  }
});

module.exports = router; 