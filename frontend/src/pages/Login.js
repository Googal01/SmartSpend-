import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20
    }}>
      <div className="card" style={{ width: 400, maxWidth: '100%' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.05rem' }}>
          ● SmartSpend
        </Link>
        <h2 style={{ marginTop: 20, fontSize: '1.3rem' }}>Welcome back</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 6 }}>Log in to see your dashboard.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}
          <button className="btn btn-primary btn-block" disabled={loading} type="submit">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
