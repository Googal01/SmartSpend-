import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';

const COLORS = ['#16A57A', '#3E7CB1', '#D8973C', '#D14C4C', '#8B5CF6', '#0F1B2D', '#66707C', '#2DB6C4', '#C2410C', '#65A30D'];

const INSIGHT_COLOR = { positive: 'var(--accent)', warning: 'var(--warn)', danger: 'var(--danger)', info: 'var(--info)' };

function scoreColor(score) {
  if (score >= 70) return 'var(--accent)';
  if (score >= 40) return 'var(--warn)';
  return 'var(--danger)';
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setErrorMsg('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><p style={{ color: 'var(--muted)' }}>Loading…</p></AppLayout>;
  if (errorMsg) return <AppLayout><p className="error-text">{errorMsg}</p></AppLayout>;

  const { totals, financialScore, recentTransactions, budgets, goals, insights, categoryBreakdown } = data;

  return (
    <AppLayout>
      <div className="grid grid-4">
        <div className="stat-card" style={{ '--stat-color': 'var(--accent)' }}>
          <div className="label">Income this month</div>
          <div className="value">₹{totals.income.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--danger)' }}>
          <div className="label">Expenses this month</div>
          <div className="value">₹{totals.expenses.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--info)' }}>
          <div className="label">Saved this month</div>
          <div className="value">₹{totals.savingsThisMonth.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': scoreColor(financialScore.score) }}>
          <div className="label">Financial Health Score</div>
          <div className="value">{financialScore.score}<span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>/100</span></div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Recent transactions</h3>
            {recentTransactions.length === 0 ? (
              <div className="empty-state">No transactions yet. Add your first one from the Transactions page.</div>
            ) : (
              <table>
                <thead><tr><th>Date</th><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                <tbody>
                  {recentTransactions.map((t) => (
                    <tr key={t._id}>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{t.description || '—'}</td>
                      <td>{t.type === 'income' ? 'Income' : t.category}</td>
                      <td style={{ textAlign: 'right', color: t.type === 'income' ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>
                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Budget status</h3>
            {budgets.length === 0 ? (
              <div className="empty-state">No budgets set for this month yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {budgets.map((b) => (
                  <div key={b._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{b.category}</span>
                      <span style={{ color: 'var(--muted)' }}>₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{
                        width: `${Math.min(b.percentUsed, 100)}%`,
                        background: b.status === 'exceeded' ? 'var(--danger)' : b.status === 'warning' ? 'var(--warn)' : 'var(--accent)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Spending by category</h3>
            {categoryBreakdown.length === 0 ? (
              <div className="empty-state">Add expenses to see a breakdown.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {categoryBreakdown.map((entry, i) => <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 8 }}>
              {categoryBreakdown.map((c, i) => (
                <span key={c.category} style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                  {c.category}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Smart insights</h3>
            <div>
              {insights.map((ins, i) => (
                <div className="insight-item" key={i}>
                  <span className="insight-dot" style={{ background: INSIGHT_COLOR[ins.type] || 'var(--muted)' }} />
                  <div>
                    <h4>{ins.title}</h4>
                    <p>{ins.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Goals in progress</h3>
            {goals.length === 0 ? (
              <div className="empty-state">No savings goals yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
                {goals.map((g) => (
                  <div key={g._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{g.name}</span>
                      <span style={{ color: 'var(--muted)' }}>{g.progressPct}%</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${g.progressPct}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
