const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    targetAmount: { type: Number, required: true, min: 1 },
    savedAmount: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', GoalSchema);
