const mongoose = require('mongoose');
const User = require('./models/User');
const Slot = require('./models/Slot');
const Transaction = require('./models/Transaction');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/parking', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Sample users with RFID tags
const users = [
  {
    name: 'John Doe',
    licensePlate: 'ABC123',
    rfidTag: 'A1B2C3D4',
    password: 'password123',
    wallet: 50.00
  },
  {
    name: 'Jane Smith',
    licensePlate: 'XYZ789',
    rfidTag: 'E5F6G7H8',
    password: 'password456',
    wallet: 75.00
  },
  {
    name: 'Bob Johnson',
    licensePlate: 'DEF456',
    rfidTag: 'I9J0K1L2',
    password: 'password789',
    wallet: 25.00
  }
];

// Sample parking slots
const slots = [
  { slotNumber: 1, occupied: false },
  { slotNumber: 2, occupied: false },
  { slotNumber: 3, occupied: false },
  { slotNumber: 4, occupied: false },
  { slotNumber: 5, occupied: false },
  { slotNumber: 6, occupied: false },
  { slotNumber: 7, occupied: false },
  { slotNumber: 8, occupied: false },
  { slotNumber: 9, occupied: false },
  { slotNumber: 10, occupied: false }
];

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Slot.deleteMany({});
    await Transaction.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Insert sample users
    const createdUsers = await User.insertMany(users);
    console.log(`Inserted ${createdUsers.length} users`);
    
    // Insert sample slots
    const createdSlots = await Slot.insertMany(slots);
    console.log(`Inserted ${createdSlots.length} parking slots`);
    
    // Add a sample transaction for each user
    for (const user of createdUsers) {
      const transaction = new Transaction({
        user: user._id,
        amount: user.wallet,
        type: 'deposit',
        method: 'card'
      });
      
      await transaction.save();
      
      user.transactions.push(transaction._id);
      await user.save();
    }
    
    console.log('Added sample transactions');
    console.log('Database seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase(); 