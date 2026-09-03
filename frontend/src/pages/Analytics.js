import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';

const COLORS = ['#16A57A', '#3E7CB1', '#D8973C', '#D14C4C', '#8B5CF6', '#0F1B2D', '#66707C', '#2DB6C4', '#C2410C', '#65A30D'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard/analytics', { params: { months } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [months]);

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <select value={months} onChange={(e) => setMonths(Number(e.target.value))} style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>
      </div>

      {loading || !data ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Income vs. expenses</h3>
            {data.trend.every((t) => t.income === 0 && t.expense === 0) ? (
              <div className="empty-state">Add transactions to see your trend over time.</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEFF3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" fill="#16A57A" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#D14C4C" name="Expense" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>All-time spending by category</h3>
            {data.categoryTotals.length === 0 ? (
              <div className="empty-state">No expense data yet.</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <ResponsiveContainer width={280} height={260}>
                  <PieChart>
                    <Pie data={data.categoryTotals} dataKey="amount" nameKey="category" outerRadius={100}>
                      {data.categoryTotals.map((entry, i) => <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {data.categoryTotals.sort((a, b) => b.amount - a.amount).map((c, i) => (
                    <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                        {c.category}
                      </span>
                      <strong>₹{c.amount.toLocaleString()}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
