/**
 * Financial Health Score
 * ------------------------------------------------------------------
 * A transparent, rule-based 0-100 score. NOT machine learning -
 * just a weighted formula over the user's own data for the current month.
 *
 * Breakdown (100 points total):
 *   1. Savings Rate        - 40 pts  -> (income - expenses) / income
 *   2. Budget Adherence    - 30 pts  -> % of budgeted categories kept under limit
 *   3. Spending Consistency- 20 pts  -> how close this month's spending is to
 *                                       the trailing 3-month average (lower swing = higher score)
 *   4. Goal Progress       - 10 pts  -> average progress % across active savings goals
 *
 * If a component has no data (e.g. no budgets set, no goals set), it is
 * excluded and the remaining points are re-distributed proportionally,
 * so a brand-new user isn't unfairly punished for missing features.
 */

function computeSavingsRateScore(income, expenses) {
  if (income <= 0) return null; // no income data -> can't judge
  const rate = (income - expenses) / income; // can be negative
  // 0% savings rate -> 0 pts, 30%+ savings rate -> full pts
  const clamped = Math.max(0, Math.min(rate / 0.3, 1));
  return clamped * 40;
}

function computeBudgetAdherenceScore(budgetsWithSpend) {
  if (!budgetsWithSpend.length) return null;
  const withinLimit = budgetsWithSpend.filter((b) => b.spent <= b.limit).length;
  return (withinLimit / budgetsWithSpend.length) * 30;
}

function computeConsistencyScore(currentMonthExpense, avgPrevExpense) {
  if (avgPrevExpense <= 0) return null;
  const diffRatio = Math.abs(currentMonthExpense - avgPrevExpense) / avgPrevExpense;
  // 0% swing -> full points, 50%+ swing -> 0 points
  const clamped = Math.max(0, Math.min(1 - diffRatio / 0.5, 1));
  return clamped * 20;
}

function computeGoalProgressScore(goals) {
  if (!goals.length) return null;
  const avgProgress =
    goals.reduce((sum, g) => sum + Math.min(g.savedAmount / g.targetAmount, 1), 0) / goals.length;
  return avgProgress * 10;
}

function calculateFinancialScore({ income, expenses, budgetsWithSpend, currentMonthExpense, avgPrevExpense, goals }) {
  const components = [
    { key: 'savingsRate', max: 40, value: computeSavingsRateScore(income, expenses) },
    { key: 'budgetAdherence', max: 30, value: computeBudgetAdherenceScore(budgetsWithSpend) },
    { key: 'consistency', max: 20, value: computeConsistencyScore(currentMonthExpense, avgPrevExpense) },
    { key: 'goalProgress', max: 10, value: computeGoalProgressScore(goals) }
  ];

  const available = components.filter((c) => c.value !== null);

  if (available.length === 0) {
    return {
      score: 0,
      breakdown: components.map((c) => ({ ...c, value: 0, applied: false })),
      note: 'Not enough data yet to calculate a score. Add transactions to get started.'
    };
  }

  const totalMaxAvailable = available.reduce((sum, c) => sum + c.max, 0);
  const scaleFactor = 100 / totalMaxAvailable;

  let finalScore = 0;
  const breakdown = components.map((c) => {
    if (c.value === null) return { ...c, value: 0, scaledPoints: 0, applied: false };
    const scaledPoints = c.value * scaleFactor;
    finalScore += scaledPoints;
    return { ...c, value: Math.round(c.value * 10) / 10, scaledPoints: Math.round(scaledPoints * 10) / 10, applied: true };
  });

  return {
    score: Math.round(Math.max(0, Math.min(finalScore, 100))),
    breakdown,
    note: null
  };
}

module.exports = { calculateFinancialScore };
