const Transaction = require('../models/Transaction');
const { CATEGORIES } = require('../models/Transaction');

// @route GET /api/transactions?type=&category=&month=&year=&page=&limit=
const getTransactions = async (req, res, next) => {
  try {
    const { type, category, month, year, page = 1, limit = 20 } = req.query;
    const query = { user: req.userId };

    if (type) query.type = type;
    if (category) query.category = category;

    if (month !== undefined && year !== undefined) {
      const start = new Date(Number(year), Number(month), 1);
      const end = new Date(Number(year), Number(month) + 1, 1);
      query.date = { $gte: start, $lt: end };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    res.json({
      transactions,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "income" or "expense"' });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (type === 'expense' && category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      amount,
      category: type === 'expense' ? (category || 'Other') : undefined,
      description,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const { type, amount, category, description, date } = req.body;

    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);

    await transaction.save();
    res.json({ transaction });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
