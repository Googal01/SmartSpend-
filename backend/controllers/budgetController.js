const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { CATEGORIES } = require('../models/Transaction');

// Helper: attach "spent" amount to each budget for its month/year
async function attachSpend(budgets, userId) {
  return Promise.all(
    budgets.map(async (b) => {
      const start = new Date(b.year, b.month, 1);
      const end = new Date(b.year, b.month + 1, 1);
      const result = await Transaction.aggregate([
        {
          $match: {
            user: b.user,
            type: 'expense',
            category: b.category,
            date: { $gte: start, $lt: end }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const spent = result[0]?.total || 0;
      return {
        _id: b._id,
        category: b.category,
        limit: b.limit,
        month: b.month,
        year: b.year,
        spent,
        remaining: Math.max(b.limit - spent, 0),
        percentUsed: Math.round((spent / b.limit) * 100),
        status: spent >= b.limit ? 'exceeded' : spent >= b.limit * 0.8 ? 'warning' : 'ok'
      };
    })
  );
}

// @route GET /api/budgets?month=&year=
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month !== undefined ? Number(req.query.month) : now.getMonth();
    const year = req.query.year !== undefined ? Number(req.query.year) : now.getFullYear();

    const budgets = await Budget.find({ user: req.userId, month, year });
    const withSpend = await attachSpend(budgets, req.userId);

    res.json({ budgets: withSpend });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/budgets
const createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }
    if (!limit || Number(limit) <= 0) {
      return res.status(400).json({ message: 'Limit must be a positive number' });
    }

    const now = new Date();
    const finalMonth = month !== undefined ? Number(month) : now.getMonth();
    const finalYear = year !== undefined ? Number(year) : now.getFullYear();

    const existing = await Budget.findOne({ user: req.userId, category, month: finalMonth, year: finalYear });
    if (existing) {
      return res.status(400).json({ message: `A budget for ${category} already exists for this month` });
    }

    const budget = await Budget.create({
      user: req.userId,
      category,
      limit,
      month: finalMonth,
      year: finalYear
    });

    res.status(201).json({ budget });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/budgets/:id
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    if (req.body.limit !== undefined) budget.limit = req.body.limit;
    await budget.save();

    res.json({ budget });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/budgets/:id
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget, attachSpend };
