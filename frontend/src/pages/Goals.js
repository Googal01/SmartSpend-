import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';

const emptyForm = { name: '', targetAmount: '', targetDate: '' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModal, setAddModal] = useState(null); // goal id being contributed to
  const [addAmount, setAddAmount] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const fetchGoals = () => {
    setLoading(true);
    api.get('/goals').then((res) => setGoals(res.data.goals)).finally(() => setLoading(false));
  };

  useEffect(fetchGoals, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/goals', form);
      setModalOpen(false);
      setForm(emptyForm);
      fetchGoals();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await api.delete(`/goals/${id}`);
    fetchGoals();
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    await api.put(`/goals/${addModal}`, { addAmount: Number(addAmount) });
    setAddModal(null);
    setAddAmount('');
    fetchGoals();
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <button className="btn btn-accent" onClick={() => setModalOpen(true)}>+ New goal</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : goals.length === 0 ? (
        <div className="card"><div className="empty-state">No savings goals yet. Create one to start tracking progress.</div></div>
      ) : (
        <div className="grid grid-3">
          {goals.map((g) => (
            <div key={g._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem' }}>{g.name}</h3>
                {g.achieved && <span className="badge badge-ok">Achieved</span>}
              </div>
              <p style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--muted)' }}>₹{g.savedAmount.toLocaleString()} of ₹{g.targetAmount.toLocaleString()}</p>
              <div className="progress-track" style={{ marginTop: 10 }}>
                <div className="progress-fill" style={{ width: `${g.progressPct}%` }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
                <div>Target date: {new Date(g.targetDate).toLocaleDateString()}</div>
                {!g.achieved && <div>Save ~₹{g.requiredMonthlySavings.toLocaleString()}/month to hit this goal</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setAddModal(g._id)}>Add funds</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New savings goal</h3>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Goal name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emergency fund" />
              </div>
              <div className="field">
                <label>Target amount (₹)</label>
                <input type="number" min="1" required value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
              </div>
              <div className="field">
                <label>Target date</label>
                <input type="date" required value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
              </div>
              {formError && <p className="error-text" style={{ marginBottom: 10 }}>{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Create goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addModal && (
        <div className="modal-backdrop" onClick={() => setAddModal(null)}>
          <div className="modal" style={{ width: 340 }} onClick={(e) => e.stopPropagation()}>
            <h3>Add funds to goal</h3>
            <form onSubmit={handleContribute}>
              <div className="field">
                <label>Amount (₹)</label>
                <input type="number" min="1" required value={addAmount} onChange={(e) => setAddAmount(e.target.value)} autoFocus />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setAddModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-accent">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
