const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret123'; // Use env var in production

// Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    const { name, licensePlate, password, rfidTag } = req.body;
    
    console.log('Parsed registration data:', {
      name: name || 'missing',
      licensePlate: licensePlate || 'missing',
      password: password ? 'provided' : 'missing',
      rfidTag: rfidTag || 'missing'
    });
    
    // Validate input with specific messages
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!licensePlate) missingFields.push('license plate');
    if (!password) missingFields.push('password');
    if (!rfidTag) missingFields.push('RFID tag');

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Check if license plate or RFID already exists
    const existingUser = await User.findOne({
      $or: [
        { licensePlate: licensePlate },
        { rfidTag: rfidTag }
      ]
    });

    if (existingUser) {
      console.log('User already exists:', {
        licensePlate: existingUser.licensePlate,
        rfidTag: existingUser.rfidTag
      });
      return res.status(400).json({ 
        success: false,
        error: 'License plate or RFID tag already registered',
        existingUser: {
          licensePlate: existingUser.licensePlate,
          rfidTag: existingUser.rfidTag
        }
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      licensePlate,
      rfidTag,
      password: hashed,
      wallet: 100 // Default wallet balance
    });

    console.log('User registered successfully:', {
      name: user.name,
      licensePlate: user.licensePlate,
      rfidTag: user.rfidTag
    });

    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      user: {
        name: user.name,
        licensePlate: user.licensePlate,
        rfidTag: user.rfidTag
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Registration failed',
      message: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { licensePlate, password } = req.body;
    
    console.log('Login attempt for:', licensePlate);

    // Find user
    const user = await User.findOne({ licensePlate });
    if (!user) {
      console.log('User not found:', licensePlate);
      return res.status(400).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('Invalid password for:', licensePlate);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid password' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id,
        licensePlate: user.licensePlate,
        rfidTag: user.rfidTag
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', licensePlate);

    res.json({ 
      success: true,
      token,
      user: {
        name: user.name,
        licensePlate: user.licensePlate,
        rfidTag: user.rfidTag,
        wallet: user.wallet
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed',
      message: error.message 
    });
  }
});

// Get user profile
router.get('/profile/:licensePlate', async (req, res) => {
  try {
    const user = await User.findOne({ licensePlate: req.params.licensePlate })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        licensePlate: user.licensePlate,
        rfidTag: user.rfidTag,
        wallet: user.wallet
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

module.exports = router; 