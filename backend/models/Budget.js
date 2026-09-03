const mongoose = require('mongoose');
const { CATEGORIES } = require('./Transaction');

const BudgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: CATEGORIES, required: true },
    limit: { type: Number, required: true, min: 1 },
    month: { type: Number, required: true, min: 0, max: 11 }, // 0-11 (JS month)
    year: { type: Number, required: true }
  },
  { timestamps: true }
);

// One budget per category per month/year per user
BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
