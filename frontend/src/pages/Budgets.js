import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Rent', 'Travel', 'Other'];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Food', limit: '' });
  const [formError, setFormError] = useState('');

  const fetchBudgets = () => {
    setLoading(true);
    api.get('/budgets').then((res) => setBudgets(res.data.budgets)).finally(() => setLoading(false));
  };

  useEffect(fetchBudgets, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/budgets', { category: form.category, limit: Number(form.limit) });
      setModalOpen(false);
      setForm({ category: 'Food', limit: '' });
      fetchBudgets();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await api.delete(`/budgets/${id}`);
    fetchBudgets();
  };

  const statusBadge = (status) => {
    if (status === 'exceeded') return <span className="badge badge-danger">Over budget</span>;
    if (status === 'warning') return <span className="badge badge-warn">Near limit</span>;
    return <span className="badge badge-ok">On track</span>;
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Monthly budgets for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        <button className="btn btn-accent" onClick={() => setModalOpen(true)}>+ New budget</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : budgets.length === 0 ? (
        <div className="card"><div className="empty-state">No budgets set for this month. Create one to start tracking a category.</div></div>
      ) : (
        <div className="grid grid-3">
          {budgets.map((b) => (
            <div key={b._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem' }}>{b.category}</h3>
                {statusBadge(b.status)}
              </div>
              <p style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--muted)' }}>₹{b.spent.toLocaleString()} spent of ₹{b.limit.toLocaleString()}</p>
              <div className="progress-track" style={{ marginTop: 10 }}>
                <div className="progress-fill" style={{
                  width: `${Math.min(b.percentUsed, 100)}%`,
                  background: b.status === 'exceeded' ? 'var(--danger)' : b.status === 'warning' ? 'var(--warn)' : 'var(--accent)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.8rem', color: 'var(--muted)' }}>
                <span>Remaining: ₹{b.remaining.toLocaleString()}</span>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New monthly budget</h3>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Monthly limit (₹)</label>
                <input type="number" min="1" required value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} />
              </div>
              {formError && <p className="error-text" style={{ marginBottom: 10 }}>{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Create budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
