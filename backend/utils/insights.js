/**
 * Smart Insights Engine
 * ------------------------------------------------------------------
 * Simple, transparent RULE-BASED checks over the user's own transaction
 * and budget data. This is intentionally NOT machine learning - each
 * insight below is a plain if/else condition, listed here so it is easy
 * to explain in a viva:
 *
 *  1. Overall spending increased vs last month (> 15%)
 *  2. A specific category increased sharply vs last month (> 25%)
 *  3. A budget is at/over 80% used (warning)
 *  4. A budget is over 100% used (violation)
 *  5. Savings rate this month is below 10% (low savings rate)
 *  6. A single large transaction (spending spike) vs the user's average transaction size
 *  7. Positive reinforcement when spending decreased vs last month
 */

function generateInsights({ currentMonthTx, prevMonthTx, budgetsWithSpend, income }) {
  const insights = [];

  const sum = (txs, type) => txs.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

  const currentExpense = sum(currentMonthTx, 'expense');
  const prevExpense = sum(prevMonthTx, 'expense');

  // 1. Overall spending increase
  if (prevExpense > 0) {
    const change = (currentExpense - prevExpense) / prevExpense;
    if (change > 0.15) {
      insights.push({
        type: 'warning',
        title: 'Spending is up this month',
        message: `Your total spending is ${Math.round(change * 100)}% higher than last month (₹${currentExpense.toFixed(0)} vs ₹${prevExpense.toFixed(0)}).`
      });
    } else if (change < -0.10) {
      // 7. Positive reinforcement
      insights.push({
        type: 'positive',
        title: 'Nice work reducing spending',
        message: `You spent ${Math.abs(Math.round(change * 100))}% less than last month. Keep it up!`
      });
    }
  }

  // 2. Category-level increase
  const byCategory = (txs) => {
    const map = {};
    txs.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  };
  const currentByCategory = byCategory(currentMonthTx);
  const prevByCategory = byCategory(prevMonthTx);

  Object.keys(currentByCategory).forEach((cat) => {
    const prevVal = prevByCategory[cat] || 0;
    const curVal = currentByCategory[cat];
    if (prevVal > 0) {
      const change = (curVal - prevVal) / prevVal;
      if (change > 0.25) {
        insights.push({
          type: 'warning',
          title: `${cat} spending jumped`,
          message: `You've spent ${Math.round(change * 100)}% more on ${cat} than last month (₹${curVal.toFixed(0)} vs ₹${prevVal.toFixed(0)}).`
        });
      }
    } else if (curVal > 0 && Object.keys(prevByCategory).length > 0) {
      insights.push({
        type: 'info',
        title: `New spending category: ${cat}`,
        message: `You spent ₹${curVal.toFixed(0)} on ${cat} this month, a category with no spending last month.`
      });
    }
  });

  // 3 & 4. Budget warnings/violations
  budgetsWithSpend.forEach((b) => {
    const pct = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
    if (pct >= 100) {
      insights.push({
        type: 'danger',
        title: `${b.category} budget exceeded`,
        message: `You've spent ₹${b.spent.toFixed(0)} of your ₹${b.limit.toFixed(0)} ${b.category} budget (${Math.round(pct)}%).`
      });
    } else if (pct >= 80) {
      insights.push({
        type: 'warning',
        title: `${b.category} budget almost used up`,
        message: `You've used ${Math.round(pct)}% of your ${b.category} budget this month.`
      });
    }
  });

  // 5. Low savings rate
  if (income > 0) {
    const savingsRate = (income - currentExpense) / income;
    if (savingsRate < 0.1) {
      insights.push({
        type: 'warning',
        title: 'Low savings rate',
        message: `You're saving ${Math.max(0, Math.round(savingsRate * 100))}% of your income this month. Financial experts often recommend aiming for at least 20%.`
      });
    }
  }

  // 6. Spending spike (single transaction much larger than average)
  const expenseAmounts = currentMonthTx.filter((t) => t.type === 'expense').map((t) => t.amount);
  if (expenseAmounts.length >= 3) {
    const avg = expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length;
    const spike = currentMonthTx.find((t) => t.type === 'expense' && t.amount > avg * 3);
    if (spike) {
      insights.push({
        type: 'info',
        title: 'Unusually large transaction',
        message: `A ${spike.category} expense of ₹${spike.amount.toFixed(0)} is much higher than your average transaction of ₹${avg.toFixed(0)}.`
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: 'positive',
      title: "You're on track",
      message: 'No unusual spending patterns detected this month. Keep tracking your transactions!'
    });
  }

  return insights;
}

module.exports = { generateInsights };
