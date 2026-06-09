# Critiks.ai — Financial Risk Intelligence Platform

> An end-to-end financial risk analysis platform powered by Machine Learning. Upload loan application datasets, get real-time risk scoring, fraud anomaly detection, and explainable AI reports — all in one dashboard.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-orange?style=flat-square&logo=scikit-learn)

---

## Features

| Module | Description |
|---|---|
| **Portfolio Overview** | Live KPIs — total loans, high-risk accounts, fraud alerts, avg DTI |
| **Risk Analytics** | ML-scored probability of default distribution + SHAP feature importance |
| **Fraud Monitoring** | Unsupervised Isolation Forest anomaly detection on uploaded datasets |
| **Scenario Simulator** | Adjust income/debt/loan sliders and get instant risk probability |
| **AI Reports** | Generate executive summaries of portfolio risk health |
| **CSV Upload** | Upload any loan dataset — auto-cleaned, feature-engineered, analyzed |

---

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — REST API framework
- [SQLAlchemy](https://www.sqlalchemy.org/) + SQLite — AI report persistence
- [scikit-learn](https://scikit-learn.org/) — Random Forest risk model + Isolation Forest fraud detection
- [SHAP](https://shap.readthedocs.io/) — Explainable AI (feature importance)
- [Pandas / NumPy](https://pandas.pydata.org/) — Data cleaning and feature engineering

**Frontend**
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/) — Risk distribution charts
- [Axios](https://axios-http.com/) — API communication
- [Lucide React](https://lucide.dev/) — Icons

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
# From the project root
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload
```

API will be available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:5173`

---

## CSV Upload Format

The platform accepts any CSV file. For full ML analysis, include these columns (names are flexible — case-insensitive):

| Standard Name | Accepted Aliases |
|---|---|
| `income` | `salary`, `applicantincome`, `annual_income` |
| `debt` | `total_debt`, `liabilities` |
| `loan_amount` | `loan`, `amount`, `credit amount`, `loanamount` |
| `age` | `client_age`, `applicant_age` |
| `employment_years` | `years_employed`, `yrs_employed`, `work_experience` |

Missing columns are flagged in the UI but do **not** block the upload.

---

## Project Structure

```
Critiks/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy engine + session
│   ├── models.py            # DB models + Pydantic schemas
│   ├── requirements.txt
│   ├── ml/
│   │   ├── risk_engine.py   # Random Forest + SHAP scoring
│   │   ├── fraud_engine.py  # Isolation Forest anomaly detection
│   │   └── explain_engine.py# AI report text generation
│   ├── routers/
│   │   ├── upload.py        # CSV upload + processing
│   │   ├── applications.py  # Portfolio stats + fraud alerts
│   │   ├── predict.py       # Single application scoring
│   │   ├── simulate.py      # Scenario simulation
│   │   ├── report.py        # AI report generation + history
│   │   └── news.py          # System audit log
│   └── services/
│       └── data_engine.py   # CSV cleaning + feature engineering
├── frontend/
│   └── src/
│       └── pages/
│           ├── PortfolioOverview.jsx
│           ├── RiskAnalytics.jsx
│           ├── FraudMonitoring.jsx
│           ├── ScenarioSimulator.jsx
│           └── AIReports.jsx
├── trained_models/          # Pre-trained .pkl model files
├── datasets/                # Sample datasets included
└── start_backend.ps1        # One-click backend starter (Windows)
```

---

## ML Models

### Risk Engine (Random Forest)
Trained on loan application data to predict probability of default. Outputs:
- Default probability (0.0 – 1.0)
- Risk tier (LOW / MEDIUM / HIGH)
- Top 3 driving factors via SHAP

### Fraud Engine (Isolation Forest)
Unsupervised anomaly detection. No labeled fraud data required. Flags statistically unusual applications based on income/debt/loan patterns.

---

## License

MIT
