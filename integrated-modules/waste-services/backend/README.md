# Waste Management Backend

Node.js/Express backend for the Waste Management System.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure `.env` file with your PostgreSQL credentials

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_password
DB_NAME=waste_management
DB_DIALECT=postgres
JWT_SECRET=super_secret_jwt_key_waste_management_2024
AI_API_KEY=your_ai_api_key_here
```

## API Documentation

See the main `SETUP_GUIDE.md` in the root directory for complete API documentation.

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **CORS**: Enabled for frontend communication

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Sequelize configuration
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── pickup.controller.js
│   │   ├── complaint.controller.js
│   │   └── ai.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── pickup.model.js
│   │   ├── complaint.model.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── pickup.routes.js
│   │   ├── complaint.routes.js
│   │   └── ai.routes.js
│   ├── app.js               # Express app setup
│   └── server.js            # Entry point
├── .env                     # Environment variables
└── package.json
```

## Features

- ✅ User authentication (register/login)
- ✅ JWT-based authorization
- ✅ Pickup request management
- ✅ Complaint tracking system
- ✅ AI-powered waste classification
- ✅ Role-based access control (user/admin)
- ✅ Auto-generated database schema
