import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: '#fff' }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '22px 6vw'
      }}>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          SmartSpend
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>Log in</Link>
          <Link to="/register" className="btn btn-accent">Get started</Link>
        </div>
      </header>

      <section style={{ padding: '8vh 6vw 10vh', maxWidth: 760 }}>
        <h1 style={{ color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.08 }}>
          See where your money actually goes.
        </h1>
        <p style={{ marginTop: 22, fontSize: '1.05rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: 560 }}>
          SmartSpend tracks your income and expenses, keeps your budgets honest, and turns your
          transaction history into a plain-language read on your financial health — no vague AI
          buzzwords, just a transparent scoring formula and rule-based alerts you can actually check.
        </p>
        <div style={{ marginTop: 34, display: 'flex', gap: 14 }}>
          <Link to="/register" className="btn btn-accent" style={{ padding: '13px 26px' }}>Create free account</Link>
          <Link to="/login" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)', padding: '13px 26px' }}>I have an account</Link>
        </div>
      </section>

      <section style={{ background: 'var(--bg)', color: 'var(--text)', padding: '7vh 6vw', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, borderRadius: '28px 28px 0 0' }}>
        {[
          { title: 'Financial Health Score', text: 'A transparent 0-100 score built from your savings rate, budget adherence, spending consistency and goal progress — with the formula shown, not hidden.' },
          { title: 'Smart Insights', text: 'Rule-based alerts catch category spending spikes, budget overruns, and low savings rates as soon as they happen.' },
          { title: 'Budgets & Goals', text: 'Set monthly category budgets and savings targets, and track exactly how much you need to save each month to hit them.' }
        ].map((f) => (
          <div key={f.title} className="card">
            <h3 style={{ fontSize: '1.05rem' }}>{f.title}</h3>
            <p style={{ marginTop: 10, fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.55 }}>{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
