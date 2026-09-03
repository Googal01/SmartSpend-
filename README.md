# SmartSpend — Personal Finance & Expense Manager

A full-stack MERN application for tracking income/expenses, budgets, savings goals,
a transparent Financial Health Score, and rule-based "Smart Insights."

No claim of machine learning is made anywhere in this project — the "smart" features
are plain, explainable if/else rules over the user's own data. This is intentional
and should be stated as-is in any report or viva.

## 1. Tech stack

| Layer          | Technology                              |
|----------------|------------------------------------------|
| Frontend       | React.js (Create React App), plain CSS  |
| Backend        | Node.js + Express.js                    |
| Database       | MongoDB + Mongoose                      |
| Auth           | JWT + bcrypt                            |
| Charts         | Recharts                                |
| Deployment     | Vercel (frontend), Render (backend), MongoDB Atlas (DB) |

## 2. Folder structure

```
smartspend/
├── backend/
│   ├── config/db.js               # Mongoose connection
│   ├── models/                    # User, Transaction, Budget, Goal
│   ├── middleware/                # auth.js (JWT check), errorHandler.js
│   ├── controllers/                # business logic per resource
│   ├── routes/                     # Express routers
│   ├── utils/
│   │   ├── financialScore.js       # 0-100 score formula
│   │   └── insights.js             # rule-based insight engine
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/axios.js            # axios instance + JWT interceptor
    │   ├── context/AuthContext.js  # login/register/logout state
    │   ├── components/             # AppLayout (sidebar), ProtectedRoute
    │   ├── pages/                  # Landing, Login, Register, Dashboard,
    │   │                           # Transactions, Analytics, Budgets, Goals, Settings
    │   ├── styles/index.css        # design tokens + all component styles
    │   ├── App.js                  # router
    │   └── index.js
    ├── package.json
    └── .env.example
```

## 3. Database schema (MongoDB collections)

**User**
```
{ name, email (unique), password (hashed), monthlyIncome, timestamps }
```

**Transaction**
```
{ user (ref), type: 'income'|'expense', amount, category, description, date, timestamps }
```
Categories: Food, Transport, Shopping, Entertainment, Bills, Education, Healthcare, Rent, Travel, Other.

**Budget**
```
{ user (ref), category, limit, month (0-11), year, timestamps }
```
Unique index on (user, category, month, year) — one budget per category per month.

**Goal**
```
{ user (ref), name, targetAmount, savedAmount, targetDate, timestamps }
```

## 4. API structure

All routes except `/api/auth/register` and `/api/auth/login` require
`Authorization: Bearer <token>` and only ever touch the logged-in user's own data.

| Method | Route                       | Description                          |
|--------|------------------------------|---------------------------------------|
| POST   | /api/auth/register            | Create account                        |
| POST   | /api/auth/login               | Log in, returns JWT                   |
| GET    | /api/auth/me                  | Current user profile                  |
| GET    | /api/transactions             | List (filters: type, category, month, year, page) |
| POST   | /api/transactions             | Create transaction                    |
| PUT    | /api/transactions/:id         | Edit transaction                      |
| DELETE | /api/transactions/:id         | Delete transaction                    |
| GET    | /api/budgets                  | List this month's budgets w/ spend    |
| POST   | /api/budgets                  | Create budget                         |
| PUT    | /api/budgets/:id               | Update limit                          |
| DELETE | /api/budgets/:id                | Delete budget                        |
| GET    | /api/goals                    | List goals w/ computed progress       |
| POST   | /api/goals                    | Create goal                           |
| PUT    | /api/goals/:id                 | Edit goal / add funds (`addAmount`)  |
| DELETE | /api/goals/:id                  | Delete goal                          |
| GET    | /api/dashboard                | Totals, score, insights, recent tx, budgets, goals |
| GET    | /api/dashboard/analytics       | Monthly income/expense trend + category totals |

## 5. Financial Health Score (transparent formula)

100 points total, re-distributed proportionally if a component has no data yet:

- **Savings rate — 40 pts**: `(income - expenses) / income`, full marks at a 30%+ savings rate.
- **Budget adherence — 30 pts**: % of this month's budgets you stayed within.
- **Spending consistency — 20 pts**: how close this month's spending is to your trailing 3-month average.
- **Goal progress — 10 pts**: average completion % across active savings goals.

Full formula code: `backend/utils/financialScore.js`.

## 6. Smart Insights (rule-based, not ML)

`backend/utils/insights.js` runs these plain checks every time the dashboard loads:
1. Overall spending up >15% vs last month
2. A category's spending up >25% vs last month
3. A budget at/over 80% used (warning)
4. A budget over 100% used (violation)
5. Savings rate below 10%
6. A single transaction much larger than your average (spending spike)
7. Positive note when spending dropped >10% vs last month

## 7. Running locally

### Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                # nodemon, http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                  # http://localhost:3000
```

## 8. Deployment guide

### Step 1 — MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com.
2. Add a database user (username/password) and whitelist `0.0.0.0/0` (or Render's IPs) under Network Access.
3. Copy the connection string — this becomes `MONGO_URI`.

### Step 2 — Backend on Render
1. Push this repo to GitHub.
2. On https://render.com, create a **New Web Service**, point it at the `backend/` folder (root directory: `backend`).
3. Build command: `npm install` — Start command: `node server.js`.
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your future Vercel URL), `PORT` (Render sets this automatically, no action needed).
5. Deploy. Note the public URL, e.g. `https://smartspend-api.onrender.com`.

### Step 3 — Frontend on Vercel
1. On https://vercel.com, import the same GitHub repo, set the root directory to `frontend`.
2. Framework preset: Create React App.
3. Add environment variable `REACT_APP_API_URL=https://smartspend-api.onrender.com/api`.
4. Deploy. Note the public URL, e.g. `https://smartspend.vercel.app`.

### Step 4 — Connect them
1. Go back to Render → your backend service → environment variables → set `CLIENT_URL` to your Vercel URL.
2. Redeploy the backend so the CORS config picks up the new origin.

### Step 5 — Test the live app
Register a new account on the live frontend URL, add a transaction, and confirm
it appears on the dashboard — this proves both frontend→backend and backend→database
connections work end to end.

### Step 6 — Updating/redeploying
Both Render and Vercel auto-redeploy on every `git push` to the connected branch
(usually `main`). To roll out a change: commit → push → both platforms rebuild automatically.
You can also trigger a manual redeploy from each platform's dashboard.

## 9. Honesty note

This project uses **rule-based logic**, not machine learning or a third-party AI API,
for the Financial Health Score and Smart Insights. This is documented here and in the
code comments so it can be represented accurately in any report, README, or viva.
