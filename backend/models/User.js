const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  licensePlate: { type: String, unique: true },
  rfidTag: { type: String, unique: true },
  password: String,
  wallet: { type: Number, default: 0 },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }]
});

module.exports = mongoose.model('User', userSchema); 