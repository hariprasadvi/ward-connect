# Waste Management System - Complete Setup Guide

## Overview
This guide provides step-by-step instructions to set up and run the complete Waste Management System with backend and frontend.

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Angular CLI (`npm install -g @angular/cli`)

## Part 1: Database Setup

### Step 1: Create PostgreSQL Database
Open your PostgreSQL client (pgAdmin or psql) and run:

```sql
CREATE DATABASE waste_management;
```

### Step 2: Verify Database Connection
Connect to the database:
```sql
\c waste_management
```

### Step 3: Tables Will Be Auto-Created
The backend uses Sequelize ORM with `sync({ alter: true })`, which means:
- Tables will be **automatically created** when you first run the backend
- The following tables will be created:
  - `Users` - Stores user accounts (admin/user)
  - `Pickups` - Stores waste pickup requests
  - `Complaints` - Stores user complaints

**You don't need to manually create tables!** They will be generated from the models.

## Part 2: Backend Setup

### Step 1: Configure Environment Variables
Navigate to `backend/.env` and update with your PostgreSQL credentials:

```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASS=YOUR_ACTUAL_PASSWORD_HERE
DB_NAME=waste_management
DB_DIALECT=postgres
JWT_SECRET=super_secret_jwt_key_waste_management_2024
AI_API_KEY=your_ai_api_key_here
```

> [!IMPORTANT]
> Replace `YOUR_ACTUAL_PASSWORD_HERE` with your PostgreSQL password!

### Step 2: Install Dependencies
```bash
cd "c:\Hari\waste services\backend"
npm install
```

### Step 3: Start the Backend
```bash
npm start
```

**Expected Output:**
```
Database connected successfully.
Models synced with database.
Server is running on port 3000
```

> [!TIP]
> For development with auto-reload, use `npm run dev` instead of `npm start`

## Part 3: Frontend Setup

The frontend is already configured! Just ensure it's running:

```bash
cd "c:\Hari\waste services"
ng serve
```

Access the application at: `http://localhost:4200`

## Part 4: Testing the System

### 1. Create Admin User (Manual)
After the backend creates tables, manually create an admin user in PostgreSQL:

```sql
-- First, register a user through the frontend, then update their role
UPDATE "Users" SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 2. Test User Flow
1. **Register**: Create a new user account
2. **Login**: Sign in with credentials
3. **Schedule Pickup**: Create a bulk waste pickup request
4. **AI Feature**: Click the sparkle icon (✨) in the description field to auto-classify waste
5. **Submit Complaint**: Test the complaint submission

### 3. Test Admin Flow
1. **Login as Admin**: Use the admin account
2. **View Dashboard**: See all pickups and complaints
3. **Manage Requests**: Update status, assign vehicles
4. **View Reports**: Check statistics

## Part 5: API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Pickups (Protected)
- `GET /api/pickups` - Get all pickups (admin) or user's pickups
- `POST /api/pickups` - Create new pickup request
- `PUT /api/pickups/:id` - Update pickup status (admin only)

### Complaints (Protected)
- `GET /api/complaints` - Get all complaints (admin) or user's complaints
- `POST /api/complaints` - Submit new complaint
- `PUT /api/complaints/:id` - Update complaint status (admin only)

### AI Features (Protected)
- `POST /api/ai/classify` - Classify waste from description
  ```json
  {
    "description": "plastic bottles and cans"
  }
  ```

## Part 6: AI Feature Details

The AI classification endpoint currently uses **smart keyword analysis**:
- "plastic", "bottle", "can" → **Recyclable**
- "food", "vegetable", "fruit" → **Organic**
- "battery", "electronic", "wire" → **Hazardous**

### To Integrate Real AI (OpenAI/Gemini):
1. Get API key from OpenAI or Google AI
2. Update `.env`: `AI_API_KEY=your_real_key`
3. Uncomment API integration code in `backend/src/controllers/ai.controller.js`
4. Install SDK: `npm install openai` or `npm install @google/generative-ai`

## Troubleshooting

### Database Connection Failed
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database `waste_management` exists

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Run `ng serve --port 4300`

### Tables Not Created
- Check backend console for errors
- Verify Sequelize connection
- Run `npm start` again

### CORS Errors
- Backend already has CORS enabled
- Ensure frontend is calling `http://localhost:3000/api`

## Database Schema

### Users Table
```
id (INTEGER, PK, AUTO)
email (STRING, UNIQUE)
password (STRING, HASHED)
name (STRING)
role (ENUM: 'user', 'admin')
phone (STRING)
address (STRING)
houseNumber (STRING)
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)
```

### Pickups Table
```
id (INTEGER, PK, AUTO)
userId (INTEGER, FK)
userName (STRING)
type (ENUM: 'regular', 'bulk')
scheduledDate (DATE)
scheduledTime (STRING)
address (STRING)
status (ENUM: 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled')
wasteType (STRING)
quantity (STRING)
description (TEXT)
assignedVehicle (STRING)
houseNumbers (ARRAY)
isAdminScheduled (BOOLEAN)
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)
```

### Complaints Table
```
id (INTEGER, PK, AUTO)
userId (INTEGER, FK)
userName (STRING)
title (STRING)
description (TEXT)
category (ENUM: 'missed-pickup', 'improper-collection', 'littering', 'illegal-dumping', 'other')
location (STRING)
photoUrl (STRING)
status (ENUM: 'pending', 'assigned', 'in-progress', 'resolved', 'closed')
assignedStaff (STRING)
resolvedAt (TIMESTAMP)
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)
```

## Next Steps

1. **Customize**: Modify models, add new features
2. **Deploy**: Use services like Heroku, Railway, or AWS
3. **Enhance AI**: Integrate real AI APIs for better classification
4. **Add Features**: 
   - Email notifications
   - SMS alerts
   - Payment integration
   - Route optimization for pickups
   - Image upload for complaints

## Support

For issues or questions, check:
- Backend logs in terminal
- Frontend console (F12 in browser)
- PostgreSQL logs
- Network tab for API errors
