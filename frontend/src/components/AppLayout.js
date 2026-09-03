import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/goals', label: 'Goals' },
  { to: '/settings', label: 'Settings' }
];

const TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/budgets': 'Budgets',
  '/goals': 'Savings Goals',
  '/settings': 'Settings'
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <div className="brand"><span className="dot" /> SmartSpend</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setNavOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: 'none' }}
            id="nav-toggle"
            onClick={() => setNavOpen((v) => !v)}
          >
            ☰
          </button>
          <h1>{TITLES[location.pathname] || 'SmartSpend'}</h1>
          <span style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            Hi, {user?.name?.split(' ')[0] || 'there'}
          </span>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
