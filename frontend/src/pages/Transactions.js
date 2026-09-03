import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Education', 'Healthcare', 'Rent', 'Travel', 'Other'];

const emptyForm = { type: 'expense', amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10) };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({ type: '', category: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const fetchTransactions = useCallback((page = 1) => {
    setLoading(true);
    const params = { page };
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    api.get('/transactions', { params })
      .then((res) => {
        setTransactions(res.data.transactions);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchTransactions(1); }, [fetchTransactions]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFormError(''); setModalOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ type: t.type, amount: t.amount, category: t.category || 'Food', description: t.description || '', date: t.date.slice(0, 10) });
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    fetchTransactions(pagination.page);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await api.put(`/transactions/${editing._id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      setModalOpen(false);
      fetchTransactions(1);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-accent" onClick={openAdd}>+ Add transaction</button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : transactions.length === 0 ? (
          <div className="empty-state">No transactions found. Add one to get started.</div>
        ) : (
          <>
            <table>
              <thead>
                <tr><th>Date</th><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th><th></th></tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.description || '—'}</td>
                    <td>{t.type === 'income' ? <span className="badge badge-ok">Income</span> : t.category}</td>
                    <td style={{ textAlign: 'right', color: t.type === 'income' ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className="btn btn-sm" style={{ background: p === pagination.page ? 'var(--ink)' : 'transparent', color: p === pagination.page ? '#fff' : 'var(--text)', border: '1px solid var(--border)' }}
                    onClick={() => fetchTransactions(p)}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit transaction' : 'Add transaction'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="field">
                <label>Amount (₹)</label>
                <input type="number" min="0.01" step="0.01" required value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              {form.type === 'expense' && (
                <div className="field">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              <div className="field">
                <label>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional note" />
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              {formError && <p className="error-text" style={{ marginBottom: 10 }}>{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">{editing ? 'Save changes' : 'Add transaction'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
