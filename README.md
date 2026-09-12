# OptiChain Platform

A full-stack machine learning application designed to predict late delivery risks in supply chain operations. Developed as a group project for the GDSE Machine Learning module.

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS v4
- **Backend**: FastAPI, Python, SQLite, SQLAlchemy, JWT Authentication
- **Machine Learning**: Scikit-Learn, XGBoost, Pandas, Joblib, Jupyter Notebooks

---

## Repository Structure

```text
optichain-platform/
├── optichain-backend/   # Unified FastAPI server, database models, & ML inference engine
├── optichain-portal/    # React + TypeScript + Vite frontend dashboard
├── ml-service/          # ML notebooks, model training scripts, & dataset
├── .gitignore
└── README.md
```

---

## Quick Start

### 1. Start the Backend API

Navigate to the backend directory, create and activate your virtual environment, install dependencies, and start the FastAPI server:

```bash
cd optichain-backend
python -m venv venv

# Windows (Command Prompt / PowerShell)
venv\Scripts\activate

# Linux / macOS
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will run on [http://127.0.0.1:8000](http://127.0.0.1:8000). Interactive Swagger documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Start the Frontend Portal

Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite development server:

```bash
cd optichain-portal
npm install
npm run dev
```

The portal will run on [http://localhost:5173](http://localhost:5173).

### 3. ML Service & Model Exploration (Optional)

To explore model training notebooks or retrain models:

```bash
cd ml-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
# source venv/bin/activate

pip install -r requirements.txt
```

---

## Key API Endpoints

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Health check endpoint | No |
| `POST` | `/api/auth/register` | Register a new user (`email`, `password`, `role`) | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT access token | No |
| `POST` | `/api/predict` | Predict supply chain late delivery risk | Yes (Bearer Token) |
| `GET` | `/api/predictions/history` | Retrieve prediction history | No |

---

## Team

- Charuka Hansaja
- Kamesh Nethsara
- Nisal Sahansith
- Sasindu Denuwan
