const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  licensePlate: { 
    type: String, 
    unique: true,
    required: true 
  },
  rfidTag: { 
    type: String, 
    unique: true,
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  wallet: { 
    type: Number, 
    default: 100,
    min: 0
  },
  transactions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Transaction' 
  }]
});

// Add pre-save middleware to log wallet changes
userSchema.pre('save', function(next) {
  if (this.isModified('wallet')) {
    console.log('Wallet balance changing for user:', this.licensePlate);
    console.log('New balance:', this.wallet);
  }
  next();
});

// Add method to add money to wallet
userSchema.methods.addMoney = async function(amount) {
  const oldBalance = this.wallet;
  this.wallet += Number(amount);
  await this.save();
  console.log(`Added ${amount} to wallet. Old balance: ${oldBalance}, New balance: ${this.wallet}`);
  return this.wallet;
};

// Add method to deduct money from wallet
userSchema.methods.deductMoney = async function(amount) {
  if (this.wallet < amount) {
    throw new Error('Insufficient balance');
  }
  const oldBalance = this.wallet;
  this.wallet -= Number(amount);
  await this.save();
  console.log(`Deducted ${amount} from wallet. Old balance: ${oldBalance}, New balance: ${this.wallet}`);
  return this.wallet;
};

// Add method to get wallet info
userSchema.methods.getWalletInfo = async function() {
  await this.populate('transactions');
  return {
    balance: this.wallet,
    transactions: this.transactions.slice(-5).reverse()
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User; 