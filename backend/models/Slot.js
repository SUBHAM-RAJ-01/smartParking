const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotNumber: Number,
  occupied: { type: Boolean, default: false },
  vehicle: { type: String, default: null },
  entryTime: { type: Date, default: null }
});

module.exports = mongoose.model('Slot', slotSchema); 