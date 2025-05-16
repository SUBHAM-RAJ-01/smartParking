const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = 'secret123'; // Use env var in production

router.post('/register', async (req, res) => {
  const { name, licensePlate, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, licensePlate, password: hashed });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'License plate already registered' });
  }
});

router.post('/login', async (req, res) => {
  const { licensePlate, password } = req.body;
  const user = await User.findOne({ licensePlate });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });
  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  res.json({ token, name: user.name, licensePlate: user.licensePlate });
});

module.exports = router; 