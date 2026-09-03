const Goal = require('../models/Goal');

function withComputed(goal) {
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const progressPct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);

  const now = new Date();
  const monthsLeft = Math.max(
    (goal.targetDate.getFullYear() - now.getFullYear()) * 12 +
      (goal.targetDate.getMonth() - now.getMonth()),
    1
  );
  const requiredMonthlySavings = Math.ceil(remaining / monthsLeft);

  return {
    _id: goal._id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    savedAmount: goal.savedAmount,
    targetDate: goal.targetDate,
    remaining,
    progressPct,
    monthsLeft,
    requiredMonthlySavings,
    achieved: goal.savedAmount >= goal.targetAmount
  };
}

// @route GET /api/goals
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.userId }).sort({ targetDate: 1 });
    res.json({ goals: goals.map(withComputed) });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/goals
const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, targetDate, savedAmount } = req.body;

    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ message: 'Name, targetAmount and targetDate are required' });
    }
    if (Number(targetAmount) <= 0) {
      return res.status(400).json({ message: 'Target amount must be positive' });
    }

    const goal = await Goal.create({
      user: req.userId,
      name,
      targetAmount,
      savedAmount: savedAmount || 0,
      targetDate: new Date(targetDate)
    });

    res.status(201).json({ goal: withComputed(goal) });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/goals/:id  (edit goal or add to savedAmount)
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const { name, targetAmount, targetDate, savedAmount, addAmount } = req.body;

    if (name) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (targetDate) goal.targetDate = new Date(targetDate);
    if (savedAmount !== undefined) goal.savedAmount = savedAmount;
    if (addAmount !== undefined) goal.savedAmount = Math.max(0, goal.savedAmount + Number(addAmount));

    await goal.save();
    res.json({ goal: withComputed(goal) });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/goals/:id
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
