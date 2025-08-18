# EventCart – Full-Stack (Frontend + Backend)

EventCart is a modern, high-efficiency platform designed to transform the way people shop for events by streamlining bulk purchasing directly from local wholesale suppliers. Whether planning a birthday, housewarming, wedding, or any other event, EventCart eliminates traditional shopping hassles by offering predefined, customizable item lists and instant ordering features.

## Features

- **Event-Based Lists**: Choose from ready-made shopping templates for events like birthdays, housewarmings, and weddings.
- **Full Customization**: Add or remove items, adjust quantities, and personalize your order based on event size or budget.
- **Direct Wholesale Access**: Connect directly with local wholesale shops for up-to-date inventory and pricing.
- **Seamless Ordering**: A fast, intuitive process that replaces hours of in-person shopping.
- **Flexible Delivery Options**: Choose between delivery by local partners or self pickup.
- **Real-Time Status Updates**: Track orders and receive notifications from suppliers and delivery partners.

## Repository Structure

- `Frontend/` – React app (Vite + Tailwind)
- `backend/` – Flask API (PostgreSQL, SQLAlchemy, JWT)
- `migrations/` – Database-related scripts/files (if used)
- `src/pages/` – Additional app pages (if applicable)

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+ running locally

## Quick Start

### 1) Backend (Flask API)

- Create and activate a virtual environment (Windows PowerShell):

  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```

- Install dependencies:

  ```bash
  pip install -r backend/requirements.txt
  ```

- Create `backend/.env` (example):

  ```env
  DATABASE_URL=postgresql://postgres:1234@localhost:5432/shifthub
  JWT_SECRET_KEY=change_me_in_prod
  FLASK_APP=app.py
  FLASK_ENV=development
  ```

- Run the API (default port 5000):

  ```bash
  python backend/app.py
  ```

> Notes:
> - On first run, the app will create the PostgreSQL database if it doesn't exist and initialize tables via `db.create_all()` in `backend/app.py`.
> - CORS is preconfigured for Vite dev ports (5173+). Adjust `allowed_origins` in `backend/app.py` if needed.

### 2) Frontend (React + Vite)

- Install dependencies:

  ```bash
  cd Frontend
  npm install
  ```

- Start the dev server (default port 5173):

  ```bash
  npm run dev
  ```

## Development URLs & Config

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API base path: `/api` (e.g., `/api/auth`, `/api/events`, `/api/orders`, `/api/admin`, `/api/cart`, `/api/dashboard`, `/api/users`)

### CORS

CORS is handled manually in `backend/app.py` via `@app.after_request` and `@app.before_request`. If your frontend runs on a different origin/port, add it to `allowed_origins`.

## Environment Variables

Backend (`backend/.env`):

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET_KEY` – JWT signing key
- `FLASK_APP` – Flask entry file (default: `app.py`)
- `FLASK_ENV` – `development` or `production`

Frontend (`Frontend/.env` – optional):

- For Vite apps, API URLs can be stored as `VITE_API_BASE_URL=http://localhost:5000`

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router, Heroicons, Axios, React Hot Toast
- Backend: Flask, Flask-JWT-Extended, Flask-SQLAlchemy, SQLAlchemy-Utils, PostgreSQL
- Auth: JWT-based authentication
- Infra/Dev: Python-dotenv, manual CORS handling

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components for different routes
- `/src/hooks` - Custom React hooks
- `/src/context` - React context for state management
- `/src/services` - API services and utilities

## Setup Instructions

1. Clone the repository:

   ```
   git clone [repository-url]
   ```

2. Navigate to the project directory:

   ```
   cd eventcart
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173` to view the application.

## Common Issues

- If frontend can't reach the API, verify `VITE_API_BASE_URL` and that the backend is running on port 5000.
- If you see CORS errors, ensure your frontend origin is listed in `allowed_origins` in `backend/app.py`.
- For DB connectivity errors, verify PostgreSQL is running and `DATABASE_URL` credentials are correct.
