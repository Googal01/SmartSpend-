const mongoose = require('mongoose');

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills',
  'Education', 'Healthcare', 'Rent', 'Travel', 'Other'
];

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Other',
      required: function () { return this.type === 'expense'; }
    },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    date: { type: Date, required: true, default: Date.now }
  },
  { timestamps: true }
);

TransactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
module.exports.CATEGORIES = CATEGORIES;
