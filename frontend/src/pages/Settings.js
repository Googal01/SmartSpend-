import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [score, setScore] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setScore(res.data.financialScore));
  }, []);

  return (
    <AppLayout>
      <div className="grid grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Account</h3>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><span style={{ color: 'var(--muted)' }}>Name: </span>{user?.name}</div>
              <div><span style={{ color: 'var(--muted)' }}>Email: </span>{user?.email}</div>
              <div><span style={{ color: 'var(--muted)' }}>Member since: </span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>About the categories</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              Expense transactions use a fixed set of categories so budgets and analytics stay consistent:
              Food, Transport, Shopping, Entertainment, Bills, Education, Healthcare, Rent, Travel, and Other.
            </p>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>How your Financial Health Score works</h3>
          <p style={{ fontSize: '0.83rem', color: 'var(--muted)', marginBottom: 14 }}>
            A transparent 0-100 score, recalculated from this month's data. No black-box AI — just four weighted components.
          </p>
          {score && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {score.breakdown.map((c) => (
                <div key={c.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {c.key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span style={{ color: 'var(--muted)' }}>{c.applied ? `${c.scaledPoints} / ${c.max} pts` : 'No data yet'}</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: c.applied ? `${(c.scaledPoints / c.max) * 100}%` : '0%' }} /></div>
                </div>
              ))}
            </div>
          )}
          <ul style={{ marginTop: 18, fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.7, paddingLeft: 18 }}>
            <li><strong>Savings rate (40 pts):</strong> (income − expenses) / income, capped at a 30% savings rate for full marks.</li>
            <li><strong>Budget adherence (30 pts):</strong> the share of this month's budgets you stayed within.</li>
            <li><strong>Spending consistency (20 pts):</strong> how close this month's spending is to your trailing 3-month average.</li>
            <li><strong>Goal progress (10 pts):</strong> average completion % across your active savings goals.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
