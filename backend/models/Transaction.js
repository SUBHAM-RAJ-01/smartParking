const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  amount: { 
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v !== 0;
      },
      message: 'Amount cannot be zero'
    }
  },
  type: { 
    type: String,
    required: true,
    enum: ['add', 'deduct']
  },
  method: { 
    type: String,
    required: true,
    enum: ['Card', 'UPI', 'Netbanking', 'Parking', 'manual']
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Add pre-save middleware to log transaction creation
transactionSchema.pre('save', function(next) {
  console.log('Creating transaction:', {
    user: this.user,
    amount: this.amount,
    type: this.type,
    method: this.method
  });
  next();
});

// Add post-save middleware to verify transaction was saved
transactionSchema.post('save', function(doc) {
  console.log('Transaction saved successfully:', doc._id);
});

// Add static method to find transactions by user
transactionSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ timestamp: -1 });
};

// Add method to get transaction details
transactionSchema.methods.getDetails = function() {
  return {
    id: this._id,
    amount: this.amount,
    type: this.type,
    method: this.method,
    timestamp: this.timestamp
  };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 