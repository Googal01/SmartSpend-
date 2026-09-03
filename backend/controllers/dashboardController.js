const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { attachSpend } = require('./budgetController');
const { calculateFinancialScore } = require('../utils/financialScore');
const { generateInsights } = require('../utils/insights');

function monthRange(year, month) {
  return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
}

// @route GET /api/dashboard
// Aggregates everything the Dashboard page needs in a single call.
const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const { start, end } = monthRange(now.getFullYear(), now.getMonth());

    const [user, currentMonthTx, allTimeTx, budgets, goals] = await Promise.all([
      User.findById(req.userId),
      Transaction.find({ user: req.userId, date: { $gte: start, $lt: end } }),
      Transaction.find({ user: req.userId }),
      Budget.find({ user: req.userId, month: now.getMonth(), year: now.getFullYear() }),
      Goal.find({ user: req.userId })
    ]);

    const income = currentMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = currentMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const totalIncomeAllTime = allTimeTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenseAllTime = allTimeTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalSavings = totalIncomeAllTime - totalExpenseAllTime;

    const budgetsWithSpend = await attachSpend(budgets, req.userId);

    // trailing 3-month average expense for consistency scoring
    const prevMonthsExpenses = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const range = monthRange(d.getFullYear(), d.getMonth());
      const txs = await Transaction.find({ user: req.userId, type: 'expense', date: { $gte: range.start, $lt: range.end } });
      prevMonthsExpenses.push(txs.reduce((s, t) => s + t.amount, 0));
    }
    const avgPrevExpense = prevMonthsExpenses.reduce((a, b) => a + b, 0) / prevMonthsExpenses.length;

    const scoreResult = calculateFinancialScore({
      income,
      expenses,
      budgetsWithSpend,
      currentMonthExpense: expenses,
      avgPrevExpense,
      goals
    });

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevRange = monthRange(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
    const prevMonthTx = await Transaction.find({ user: req.userId, date: { $gte: prevRange.start, $lt: prevRange.end } });

    const insights = generateInsights({ currentMonthTx, prevMonthTx, budgetsWithSpend, income });

    const recentTransactions = await Transaction.find({ user: req.userId }).sort({ date: -1, createdAt: -1 }).limit(5);

    // spending by category for current month (for pie/bar chart)
    const categoryBreakdown = {};
    currentMonthTx.filter((t) => t.type === 'expense').forEach((t) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    res.json({
      totals: {
        income,
        expenses,
        savingsThisMonth: income - expenses,
        totalSavings
      },
      financialScore: scoreResult,
      recentTransactions,
      budgets: budgetsWithSpend,
      goals: goals.slice(0, 3),
      insights,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, amount]) => ({ category, amount }))
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/dashboard/analytics?months=6
// Monthly income vs expense trend + category totals for the Analytics page.
const getAnalytics = async (req, res, next) => {
  try {
    const monthsBack = Math.min(12, Math.max(1, parseInt(req.query.months, 10) || 6));
    const now = new Date();
    const trend = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { start, end } = monthRange(d.getFullYear(), d.getMonth());
      const txs = await Transaction.find({ user: req.userId, date: { $gte: start, $lt: end } });
      trend.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        income: txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      });
    }

    const allTx = await Transaction.find({ user: req.userId, type: 'expense' });
    const categoryTotals = {};
    allTx.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    res.json({
      trend,
      categoryTotals: Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }))
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary, getAnalytics };
