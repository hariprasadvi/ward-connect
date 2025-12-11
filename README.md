# WardConnect

## Project Setup

### 1. Backend (Node.js/Express)
1. Navigate to `server` folder: `cd server`
2. Install dependencies (if not done): `npm install`
3. **IMPORTANT**: Open `.env` file and set your `GEMINI_API_KEY`.
4. Start server: `node index.js`
   - Runs on Port 3000.

### 2. Frontend (Angular 16)
1. Navigate to `client` folder: `cd client`
2. Install dependencies (if not done): `npm install`
3. Start Angular server: `ng serve` or `npm start`
4. Open browser at `http://localhost:4200`

## Features Implemented
- **Welcome Page**: 8 Modules Grid with Language Toggle (English/Malayalam).
- **Job/Education Module**:
  - **Dashboard**: Links to features.
  - **Chatbot**: Integrated with Google Gemini API for E-learning guidance.
  - **CV Generator**: Generates professional CVs using Gemini.
  - **Apply Job**: Mock job listing and application.
