# How to Run WardConnect

## Prerequisites
1.  **Node.js** installed.
2.  **PostgreSQL** installed and running on port `5432`.
3.  **Database**: A database named `wardconnect` must exist (created automatically if using the provided scripts).

## One-Command Start
To start both the backend and frontend simultaneously, run:

```bash
npm run dev
```

## First Time Setup
If you are running this for the first time, install dependencies:

```bash
npm install
npm run install-all
```

## Access
- **Frontend**: [http://localhost:4200](http://localhost:4200)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
