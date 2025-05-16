const express = require('express');
const multer = require('multer');
const axios = require('axios');
const Slot = require('../models/Slot');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', upload.single('image'), async (req, res) => {
  // Send image to Python ANPR service
  const fs = require('fs');
  const FormData = require('form-data');
  form = new FormData();
  form.append('image', fs.createReadStream(req.file.path));

  const response = await axios.post('http://localhost:6000/anpr', form, {
    headers: form.getHeaders()
  });
  const plate = response.data.plate;

  // Assign slot
  const slot = await Slot.findOne({ occupied: false });
  if (!slot) return res.status(400).json({ error: 'No slots available' });
  slot.occupied = true;
  slot.vehicle = plate;
  slot.entryTime = new Date();
  await slot.save();

  res.json({ plate, slot: slot.slotNumber });
});

module.exports = router; 