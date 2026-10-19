# Expense Tracker 💰

A full-stack Expense Tracker web application built using **React, Django REST Framework, and MySQL**. It helps users manage their income and expenses, organize transactions by category, and monitor their financial activity through a dashboard with charts.

## 🚀 Features

- **User Authentication:** Register, login, and logout.
- **Dashboard:** View total income, total expenses, and financial summaries.
- **Transaction Management:** Add and view income and expense transactions.
- **Category Management:** Organize transactions by category.
- **Data Visualization:** View income and expenses through charts.
- **Recent Transactions:** Review recently added transactions.
- **User-Specific Data:** Users can access their own financial records.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development server |
| Django | Backend framework |
| Django REST Framework | REST API development |
| MySQL | Database |
| JWT Authentication | API authentication |
| Recharts | Dashboard charts |
| HTML and CSS | Structure and styling |
| JavaScript | Application logic |

## 📁 Project Structure

```text
expense-tracker/
├── backend/
│   ├── config/
│   ├── expenses/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/kamalesh51217845-tech/expense-tracker.git
cd expense-tracker
```

### 2. Set up the Django backend

Open a terminal in the backend directory:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure MySQL

1. Install and start MySQL Server.
2. Create a database named `expense_tracker`.
3. Configure your database name, username, password, and host in your Django settings or environment variables, according to your project configuration.

Example database creation:

```sql
CREATE DATABASE expense_tracker;
```

**Note:** Configure your Django secret key and database credentials securely. Do not commit real passwords or secret keys to GitHub.

### 4. Apply database migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Start the backend server

```bash
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000/`

### 6. Set up the React frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Install Recharts if it is not already listed in your dependencies:

```bash
npm install recharts
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually `http://localhost:5173/`.

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register/` | Register a user |
| POST | `/api/login/` | Log in |
| POST | `/api/token/refresh/` | Refresh an access token |
| GET | `/api/dashboard/` | Retrieve dashboard summaries |
| GET | `/api/categories/` | Retrieve categories |
| GET, POST | `/api/transactions/` | View or add transactions |

Authenticated endpoints require a valid JWT access token.

## 📊 Dashboard

The dashboard provides a financial summary, income-versus-expense visualization, expense category chart, and recent transaction history.

## 🎯 Project Objective

The objective of this project is to develop a practical full-stack application that helps users track income and expenses, understand their spending patterns, and manage personal finances in one place.

## 👨‍💻 Author

**Kamalesh**

GitHub: [kamalesh51217845-tech](https://github.com/kamalesh51217845-tech)

## 📄 License

This project is intended for learning and portfolio demonstration. Add a formal license if you want others to reuse or distribute the code under specific terms.
