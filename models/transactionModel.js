const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  address: { type: String, required: true },
  hash: { type: String, required: true },
  value: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

transactionSchema.index({ address: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
