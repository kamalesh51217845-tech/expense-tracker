
import { useState } from "react";
import { apiRequest } from "./api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./App.css";

const COLORS = ["#0f766e", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#8b5cf6"];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function App() {
  const [page, setPage] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);

  const [dashboard, setDashboard] = useState({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactionType, setTransactionType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiRequest("/register/", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      setSuccess("Your account is ready. Please log in.");
      setPage("login");
      setPassword("");
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await apiRequest("/login/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (!result?.access) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      await loadDashboard(result.access);
      setToken(result.access);
      setPassword("");
    } catch (err) {
      setToken(null);
      setError(err.message || "Login failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(accessToken) {
    const [summary, records, categoryList] = await Promise.all([
      apiRequest("/dashboard/", {}, accessToken),
      apiRequest("/transactions/", {}, accessToken),
      apiRequest("/categories/", {}, accessToken),
    ]);

    setDashboard(summary);
    setTransactions(
      Array.isArray(records) ? records : records.results || []
    );
    setCategories(
      Array.isArray(categoryList)
        ? categoryList
        : categoryList.results || []
    );
  }

  async function handleAddTransaction(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await apiRequest(
        "/transactions/",
        {
          method: "POST",
          body: JSON.stringify({
            category: Number(category),
            transaction_type: transactionType,
            amount,
            description,
            date,
          }),
        },
        token
      );

      await loadDashboard(token);
      setAmount("");
      setDescription("");
      setSuccess("Transaction added successfully!");
    } catch (err) {
      setError(err.message || "Could not save this transaction.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    setToken(null);
    setDashboard({ total_income: 0, total_expenses: 0, balance: 0 });
    setTransactions([]);
    setCategories([]);
    setUsername("");
    setEmail("");
    setPassword("");
    setCategory("");
    setError("");
    setSuccess("");
    setPage("login");
  }

  const chartSummary = [
    { name: "Income", amount: Number(dashboard.total_income || 0) },
    { name: "Expenses", amount: Number(dashboard.total_expenses || 0) },
  ];

  const expenseByCategory = transactions.reduce((result, item) => {
    if (item.transaction_type === "EXPENSE") {
      const name = item.category_name || "Other";
      result[name] = (result[name] || 0) + Number(item.amount || 0);
    }
    return result;
  }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateCompare = String(b.date).localeCompare(String(a.date));
      return dateCompare || Number(b.id || 0) - Number(a.id || 0);
    })
    .slice(0, 10);

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-shell">
          <aside className="auth-brand">
            <div className="brand-mark">₹</div>
            <p className="brand-eyebrow">YOUR MONEY, IN FOCUS</p>
            <h1>Make every rupee count.</h1>
            <p className="brand-description">
              Understand your spending, keep track of your income, and build
              better money habits — one day at a time.
            </p>

            <div className="brand-stat">
              <span className="brand-stat-icon">↗</span>
              <div>
                <strong>Spend smarter.</strong>
                <p>Know where your money goes.</p>
              </div>
            </div>

            <div className="brand-footer">Simple finances. Clear decisions.</div>
          </aside>

          <section className="auth-content">
            <div className="mobile-brand">
              <span className="brand-mark">₹</span>
              <span>Expense Tracker</span>
            </div>

            <div className="auth-heading">
              <span className="eyebrow">
                {page === "login" ? "WELCOME BACK" : "GET STARTED"}
              </span>
              <h2>
                {page === "login" ? "Sign in to your account" : "Create your account"}
              </h2>
              <p>
                {page === "login"
                  ? "Enter your details to access your dashboard."
                  : "Create an account to start managing your money."}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={page === "login" ? "selected" : ""}
                onClick={() => {
                  setPage("login");
                  setError("");
                  setSuccess("");
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={page === "register" ? "selected" : ""}
                onClick={() => {
                  setPage("register");
                  setError("");
                  setSuccess("");
                }}
              >
                Create account
              </button>
            </div>

            {error && <div className="notice error-message">{error}</div>}
            {success && <div className="notice success-message">{success}</div>}

            {page === "register" ? (
              <form className="auth-form" onSubmit={handleRegister}>
                <label htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />

                <label htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button className="primary-button" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create account →"}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleLogin}>
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />

                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button className="primary-button" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in →"}
                </button>
              </form>
            )}

            <p className="auth-legal">
              Your personal finance overview, all in one place.
            </p>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="brand-mark small-mark">₹</span>
          <div>
            <h1>Expense Tracker</h1>
            <p>Your personal finance overview</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="user-greeting">
            Hello, <strong>{username}</strong>
          </span>
          <button className="logout-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="welcome-row">
          <div>
            <span className="eyebrow">YOUR FINANCES</span>
            <h2>Dashboard</h2>
            <p>Here’s how your money is looking today.</p>
          </div>
          <div className="today-pill">
            <span>●</span> Overview
          </div>
        </section>

        {error && <div className="notice error-message">{error}</div>}
        {success && <div className="notice success-message">{success}</div>}

        <section className="summary-cards">
          <article className="summary-card income-card">
            <div className="summary-top">
              <span>Total income</span>
              <span className="summary-icon">↗</span>
            </div>
            <h3>{money(dashboard.total_income)}</h3>
            <p>Money received</p>
          </article>

          <article className="summary-card expense-card">
            <div className="summary-top">
              <span>Total expenses</span>
              <span className="summary-icon">↘</span>
            </div>
            <h3>{money(dashboard.total_expenses)}</h3>
            <p>Money spent</p>
          </article>

          <article className="summary-card balance-card">
            <div className="summary-top">
              <span>Available balance</span>
              <span className="summary-icon">₹</span>
            </div>
            <h3>{money(dashboard.balance)}</h3>
            <p>Income minus expenses</p>
          </article>
        </section>

        <section className="charts-grid">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h3>Income vs expenses</h3>
                <p>Compare your money coming in and going out</p>
              </div>
              <span className="panel-icon">▥</span>
            </div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartSummary}
                  margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9efee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={55}
                    tickFormatter={(value) =>
                      value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`
                    }
                  />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="amount" fill="#0f766e" radius={[7, 7, 0, 0]} maxBarSize={68} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h3>Spending by category</h3>
                <p>See which categories use your money</p>
              </div>
              <span className="panel-icon">◔</span>
            </div>
            {pieData.length === 0 ? (
              <div className="empty-chart">
                <span>◔</span>
                <p>No expense data yet</p>
                <small>Add an expense to see your category breakdown.</small>
              </div>
            ) : (
              <div className="chart-area pie-area">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={52}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {pieData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => money(value)} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>
        </section>

        <section className="content-grid">
          <article className="panel transaction-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent transactions</h3>
                <p>Your latest financial activity</p>
              </div>
              <span className="count-pill">{transactions.length} total</span>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="empty-state">
                <span>＋</span>
                <h4>No transactions yet</h4>
                <p>Add your first transaction to see it here.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((item) => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>
                          <div className="transaction-name">
                            <span
                              className={`transaction-dot ${
                                item.transaction_type === "INCOME" ? "dot-income" : "dot-expense"
                              }`}
                            />
                            <div>
                              <strong>{item.description || item.category_name || "Transaction"}</strong>
                              <small>{item.transaction_type === "INCOME" ? "Income" : "Expense"}</small>
                            </div>
                          </div>
                        </td>
                        <td>{item.category_name || "—"}</td>
                        <td
                          className={
                            item.transaction_type === "INCOME" ? "income-text" : "expense-text"
                          }
                        >
                          {item.transaction_type === "INCOME" ? "+" : "−"}
                          {money(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="panel add-panel">
            <div className="panel-heading">
              <div>
                <h3>Add transaction</h3>
                <p>Record income or an expense</p>
              </div>
              <span className="panel-icon">＋</span>
            </div>

            <form className="transaction-form" onSubmit={handleAddTransaction}>
              <label htmlFor="transaction-type">Transaction type</label>
              <div className="type-switch">
                <button
                  type="button"
                  className={transactionType === "EXPENSE" ? "type-active expense-active" : ""}
                  onClick={() => setTransactionType("EXPENSE")}
                >
                  − Expense
                </button>
                <button
                  type="button"
                  className={transactionType === "INCOME" ? "type-active income-active" : ""}
                  onClick={() => setTransactionType("INCOME")}
                >
                  + Income
                </button>
              </div>

              <label htmlFor="transaction-amount">Amount (₹)</label>
              <input
                id="transaction-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              <label htmlFor="transaction-category">Category</label>
              <select
                id="transaction-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Choose a category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <label htmlFor="transaction-description">Description</label>
              <input
                id="transaction-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch, salary..."
              />

              <label htmlFor="transaction-date">Date</label>
              <input
                id="transaction-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <button
                className="primary-button add-button"
                type="submit"
                disabled={saving || categories.length === 0}
              >
                {saving ? "Saving transaction..." : "＋ Add transaction"}
              </button>

              {categories.length === 0 && (
                <p className="form-hint">No categories available for this account.</p>
              )}
            </form>
          </article>
        </section>

        <footer className="dashboard-footer">
          <span>Expense Tracker</span>
          <span>Take control of your finances, one step at a time.</span>
        </footer>
      </div>
    </main>
  );
}

export default App;
