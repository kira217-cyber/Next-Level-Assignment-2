# DevPulse API

A collaborative internal tech issue and feature tracking backend built with Node.js, TypeScript, Express.js, and PostgreSQL.

The platform allows software teams to report bugs, suggest feature requests, manage workflows, and coordinate issue resolution using role-based access control.

---

# 🚀 Live URL

```bash
https://your-vercel-project.vercel.app
```

# 📂 GitHub Repository

```bash
https://github.com/yourusername/devpulse
```

---

# ✨ Features

- User registration and login
- JWT based authentication and authorization
- Role based access control
- Create, read, update, and delete issues
- Maintainer can update issue workflow status
- Issue filtering and sorting
- PostgreSQL connection pooling
- Raw SQL queries only
- No ORM or query builder
- Centralized error handling middleware
- Strict TypeScript architecture

---

# 🛠️ Tech Stack

| Category       | Technology            |
| -------------- | --------------------- |
| Runtime        | Node.js               |
| Language       | TypeScript            |
| Framework      | Express.js            |
| Database       | PostgreSQL + NeonDB   |
| Driver         | pg                    |
| Authentication | bcrypt + jsonwebtoken |

---

# 📁 Project Structure

```bash
src/
├── config/
│   └── db.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   └── error.middleware.ts
├── modules/
│   ├── auth/
│   └── issues/
├── utils/
├── app.ts
└── server.ts
```

---

# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/yourusername/devpulse.git
```

## Move Into Project

```bash
cd devpulse
```

## Install Dependencies

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

DATABASE_URL=your_neondb_postgresql_connection_string

JWT_SECRET=your_secure_jwt_secret

JWT_EXPIRES_IN=7d
```

---

# ▶️ Run Development Server

```bash
npm run dev
```

# 🏗️ Build Project

```bash
npm run build
```

# 🚀 Start Production Server

```bash
npm start
```

---

# 🗄️ Database Schema Summary

## users table

| Field    | Type                     |
| -------- | ------------------------ |
| id       | SERIAL PRIMARY KEY       |
| name     | VARCHAR(100)             |
| email    | VARCHAR(150) UNIQUE      |
| password | TEXT                     |
| role     | contributor / maintainer |

---

## issues table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(150)                  |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | INTEGER                       |

---

# 🌐 API Endpoints

## Authentication

| Method | Endpoint         |
| ------ | ---------------- |
| POST   | /api/auth/signup |
| POST   | /api/auth/login  |

---

## Issues

| Method | Endpoint        |
| ------ | --------------- |
| POST   | /api/issues     |
| GET    | /api/issues     |
| GET    | /api/issues/:id |
| PATCH  | /api/issues/:id |
| DELETE | /api/issues/:id |

---

# 🔎 Query Parameters

| Parameter | Allowed Values              |
| --------- | --------------------------- |
| sort      | newest, oldest              |
| type      | bug, feature_request        |
| status    | open, in_progress, resolved |

Example:

```http
GET /api/issues?sort=oldest&type=bug&status=open
```

---

# 🔑 Authentication Header

```http
Authorization: YOUR_JWT_TOKEN
```

---

# 👥 Role Permissions

## Contributor

- Register and login
- Create issues
- View all issues
- Update own open issues

## Maintainer

- All contributor permissions
- Update any issue
- Change issue status
- Delete any issue

---

# ✅ Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

# ❌ Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": "Error details"
}
```

---

# 🧠 Important Technical Decisions

- Raw SQL queries are used throughout the project
- No ORM or Query Builder used
- No SQL JOIN queries used
- Reporter data attached manually
- Passwords hashed using bcrypt
- JWT payload includes id, name, and role
- Centralized error handling implemented

---

# ☁️ Vercel Deployment

## vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.ts"
    }
  ]
}
```

---

# 🌍 Vercel Environment Variables

```env
DATABASE_URL=your_neondb_connection_string

JWT_SECRET=your_secure_jwt_secret

JWT_EXPIRES_IN=7d

NODE_ENV=production
```

---

# 📌 Final Submission Checklist

- Public GitHub repository
- Minimum 10 meaningful commits
- Public Vercel deployment
- NeonDB connected successfully
- All APIs tested in Postman
- Professional README.md
- JWT protected routes working
- Role permissions working
- Interview video link public

---

# 👨‍💻 Author

Developed by Oracle Soft
