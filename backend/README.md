# Backend Team - Development Guide

## 👥 Team: Vivek, Srilatha

## 🎯 Responsibilities

**Vivek (Lead):**
- Authentication system (JWT, login/register)
- User management API
- Database initialization
- Middleware setup

**Srilatha (Support):**
- Student profile endpoints
- Student search functionality
- Profile data management

---

## 📁 Folder Structure

```
backend/src/
├── server.ts              # Express server
├── routes/               # API endpoints
│   ├── auth.ts          # Login, register, token refresh
│   ├── users.ts         # User CRUD endpoints
│   ├── students.ts      # Student profile endpoints
│   ├── companies.ts     # Company endpoints
│   └── interviews.ts    # Interview endpoints
├── controllers/          # Request handlers
│   ├── authController.ts
│   ├── userController.ts
│   ├── studentController.ts
│   └── companyController.ts
├── models/              # Database schemas
│   ├── User.ts
│   ├── Student.ts
│   ├── Company.ts
│   └── Interview.ts
├── middleware/          # Auth & validation
│   ├── auth.ts         # JWT verification
│   ├── errorHandler.ts
│   └── validator.ts
└── services/           # Database operations
    ├── userService.ts
    ├── studentService.ts
    └── companyService.ts
```

---

## 🚀 Quick Start

```bash
# Navigate to backend
cd backend

# Install dependencies (if separate package.json)
npm install

# Start development server
npm run dev

# Your server will run on http://localhost:3000
```

---

## 📝 API Endpoint Examples

### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
POST /api/auth/refresh     - Refresh JWT token
POST /api/auth/logout      - Logout user
```

### User Management
```
GET  /api/users/:id        - Get user by ID
PUT  /api/users/:id        - Update user
GET  /api/users            - List all users
```

### Student Profiles
```
GET  /api/students         - List all students
GET  /api/students/:id     - Get student profile
PUT  /api/students/:id     - Update student profile
POST /api/students/search  - Search students
```

### Companies
```
GET  /api/companies        - List companies
GET  /api/companies/:id    - Get company details
```

### Interviews
```
POST /api/interviews       - Schedule interview
GET  /api/interviews/:id   - Get interview details
PUT  /api/interviews/:id   - Update interview status
```

---

## 💾 Database Tables

Tables created automatically in `placement.db`:

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT (student/company/admin),
  avatar_url TEXT,
  created_at DATETIME
)

-- Student profiles
CREATE TABLE student_profiles (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  college TEXT,
  cgpa REAL,
  resume_url TEXT,
  bio TEXT,
  skills TEXT (JSON),
  experience TEXT,
  created_at DATETIME
)

-- Companies
CREATE TABLE companies (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE,
  company_name TEXT,
  industry TEXT,
  description TEXT,
  logo_url TEXT,
  created_at DATETIME
)

-- Interviews
CREATE TABLE interviews (
  id INTEGER PRIMARY KEY,
  student_id INTEGER,
  company_id INTEGER,
  scheduled_at DATETIME,
  status TEXT (scheduled/ongoing/completed),
  recording_url TEXT,
  created_at DATETIME
)
```

---

## 🔧 Development Workflow

### Step 1: Create a New Endpoint

**File:** `backend/src/routes/students.ts`
```typescript
import express from 'express';
import { auth } from '../middleware/auth';
import * as studentController from '../controllers/studentController';

const router = express.Router();

// Protected route - requires authentication
router.get('/:id', auth, studentController.getStudent);
router.post('/search', auth, studentController.searchStudents);

export default router;
```

### Step 2: Create Controller

**File:** `backend/src/controllers/studentController.ts`
```typescript
import { Request, Response } from 'express';
import * as studentService from '../services/studentService';

export async function getStudent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentById(id);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Step 3: Create Service

**File:** `backend/src/services/studentService.ts`
```typescript
import db from '../models/database'; // SQLite instance

export async function getStudentById(id: string) {
  const stmt = db.prepare(
    'SELECT * FROM student_profiles WHERE id = ?'
  );
  return stmt.get(id);
}
```

### Step 4: Register Route in Server

**File:** `backend/src/server.ts`
```typescript
import studentRoutes from './routes/students';

app.use('/api/students', studentRoutes);
```

---

## 🔐 Authentication Flow

1. User sends credentials to `/api/auth/register` or `/api/auth/login`
2. Server validates and creates JWT token
3. Frontend stores token in localStorage
4. Frontend sends token in header: `Authorization: Bearer <token>`
5. Server middleware verifies token
6. Request proceeds if valid, rejected if invalid

---

## 📊 Common Tasks

### Adding a new database field
```typescript
// In migration/initialization:
db.exec(`ALTER TABLE users ADD COLUMN phone_number TEXT;`);
```

### Creating a new API endpoint
1. Create route file in `routes/`
2. Create controller function in `controllers/`
3. Create service function in `services/`
4. Register route in `server.ts`
5. Test with curl or Postman

### Handling errors
```typescript
try {
  // Do something
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

---

## 🐛 Debugging

### View database contents
```bash
sqlite3 placement.db
> SELECT * FROM users;
> .tables
```

### Check server logs
- Express logs all requests
- Database errors logged to console
- Check browser console for frontend errors

### Test API endpoints
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456","role":"student"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'
```

---

## ✅ Checklist for New Endpoints

- [ ] Create route handler in `routes/`
- [ ] Create controller in `controllers/`
- [ ] Create service in `services/`
- [ ] Register in `server.ts`
- [ ] Add error handling
- [ ] Test with curl/Postman
- [ ] Commit changes with clear message
- [ ] Push to your branch

---

## 📚 Technology Stack

- **Framework:** Express.js
- **Database:** SQLite (better-sqlite3)
- **Authentication:** JWT + bcryptjs
- **Language:** TypeScript

---

## 🔄 Git Workflow for Backend

```bash
# Create feature branch
git checkout -b feature/add-student-search

# Make changes in backend/src/
nano backend/src/routes/students.ts

# Commit frequently
git add backend/
git commit -m "feat: add student search endpoint"

# Push
git push origin feature/add-student-search

# When done, merge to your personal branch
git checkout vivek
git merge feature/add-student-search
git push origin vivek
```

---

**Remember:** Commit frequently! Each meaningful change = a new commit.
