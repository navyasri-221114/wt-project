# Frontend Team - Development Guide

## 👥 Team: Varshitha, NavyaSri

## 🎯 Responsibilities

**Varshitha (Lead):**
- Page layouts (LandingPage, AuthPage, Dashboards)
- Component structure
- Frontend routing
- Page navigation

**NavyaSri (Support):**
- Styling (CSS/Tailwind)
- UI/UX components
- Responsive design
- Theme consistency

---

## 📁 Folder Structure

```
frontend/src/
├── App.tsx                # Root component
├── main.tsx              # React entry point
├── pages/               # Page components
│   ├── LandingPage.tsx
│   ├── AuthPage.tsx
│   ├── AdminDashboard.tsx
│   ├── StudentDashboard.tsx
│   ├── CompanyDashboard.tsx
│   ├── StudentProfileView.tsx
│   ├── StudentSearch.tsx
│   ├── ExploreCompanies.tsx
│   ├── ProfilePage.tsx
│   └── AdminLoginPage.tsx
├── components/         # Reusable components
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── ...
├── services/          # API calls to backend
│   └── api.ts
├── lib/              # Utility functions
│   └── utils.ts
└── styles/           # CSS files
    ├── index.css
    ├── tailwind.css
    └── components.css
```

---

## 🚀 Quick Start

```bash
# Navigate to frontend
cd frontend

# Start development server
npm run dev

# Your app will run on http://localhost:5173
```

---

## 🎨 Page Breakdown

### Pages You'll Create/Modify

```
📄 LandingPage.tsx
  - Hero section
  - Features showcase
  - Call-to-action buttons
  - Navigation

📄 AuthPage.tsx
  - Login form
  - Register form
  - Form validation
  - API calls to /api/auth/

📄 StudentDashboard.tsx
  - Student stats
  - Interview schedule
  - Profile summary
  - Quick actions

📄 CompanyDashboard.tsx
  - Company stats
  - Job postings
  - Applicant list
  - Shortlist management

📄 AdminDashboard.tsx
  - System stats
  - User management
  - Company management
  - Analytics

📄 StudentProfileView.tsx
  - View student profile
  - Edit student info
  - Upload resume
  - Skills management

📄 StudentSearch.tsx
  - Search students
  - Filter by skills
  - Student cards
  - Pagination

📄 ExploreCompanies.tsx
  - Company listings
  - Company details
  - Job postings
  - Apply buttons

📄 ProfilePage.tsx
  - User profile
  - Settings
  - Account management
  - Privacy settings

📄 AdminLoginPage.tsx
  - Admin login form
  - Admin verification
```

---

## 🎯 Component Examples

### Create a Reusable Button Component

**File:** `frontend/src/components/Button.tsx`
```typescript
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded font-semibold';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### Create a Page Component

**File:** `frontend/src/pages/StudentDashboard.tsx`
```typescript
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { api } from '../services/api';

export function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch student data from backend
    api.get('/api/students/me')
      .then(res => setStudent(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <h1>Student Dashboard</h1>
      {student && (
        <div>
          <h2>Welcome, {student.name}!</h2>
          <p>GPA: {student.cgpa}</p>
          <Button variant="primary">Edit Profile</Button>
        </div>
      )}
    </Layout>
  );
}
```

---

## 🎨 Styling with Tailwind

The project uses Tailwind CSS. Example:

```typescript
// Using Tailwind classes
<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
  <h1 className="text-2xl font-bold text-blue-900">
    Welcome to Dashboard
  </h1>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Get Started
  </button>
</div>
```

---

## 🔗 API Integration

### Making API Calls

**File:** `frontend/src/services/api.ts`
```typescript
import axios, { AxiosError } from 'axios';

const API_BASE = 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  get: (url: string) => client.get(url),
  post: (url: string, data: any) => client.post(url, data),
  put: (url: string, data: any) => client.put(url, data),
  delete: (url: string) => client.delete(url)
};
```

### Using API in Components

```typescript
useEffect(() => {
  api.get('/api/students')
    .then(res => setStudents(res.data))
    .catch(err => console.error('Error fetching students:', err));
}, []);
```

---

## 🧭 Routing Setup

**File:** `frontend/src/App.tsx`
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🔄 Development Workflow

### Creating a New Page

1. **Create page file**
   ```bash
   touch frontend/src/pages/NewPage.tsx
   ```

2. **Create components if needed**
   ```bash
   touch frontend/src/components/NewComponent.tsx
   ```

3. **Update routing in App.tsx**
   ```typescript
   <Route path="/newpage" element={<NewPage />} />
   ```

4. **Style with Tailwind**
   ```typescript
   <div className="flex gap-4 p-6 bg-gray-100 rounded-lg">
     {/* content */}
   </div>
   ```

5. **Test in browser**
   ```bash
   npm run dev
   ```

6. **Commit your work**
   ```bash
   git add frontend/
   git commit -m "feat: create new page with components"
   git push origin feature/new-page
   ```

---

## ✅ Frontend Checklist

When creating a new feature:

- [ ] Create page/component files
- [ ] Add routing to App.tsx
- [ ] Style with Tailwind CSS
- [ ] Add API calls if needed
- [ ] Test in browser
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Make responsive for mobile
- [ ] Commit frequently
- [ ] Push to your branch

---

## 📱 Responsive Design Tips

```typescript
// Mobile-first approach
<div className="
  flex flex-col              // Stack on mobile
  md:flex-row               // Row on tablet+
  gap-4                     // Gap between items
  p-4 md:p-8               // More padding on desktop
  text-sm md:text-base     // Larger text on desktop
">
  {/* content */}
</div>
```

---

## 🐛 Common Issues & Solutions

### Issue: API calls not working
**Solution:** Check token in localStorage, verify backend is running

### Issue: Styling not applied
**Solution:** Restart dev server after CSS changes, check Tailwind classes

### Issue: Page not found (404)
**Solution:** Check routing in App.tsx, verify file path

### Issue: Components not rendering
**Solution:** Check for prop issues, use React DevTools

---

## 📚 Technology Stack

- **Framework:** React 19
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **HTTP:** Axios
- **Language:** TypeScript

---

## 🔄 Git Workflow for Frontend

```bash
# Create feature branch
git checkout -b feature/add-student-dashboard

# Make changes in frontend/src/
nano frontend/src/pages/StudentDashboard.tsx

# Commit frequently
git add frontend/
git commit -m "feat: create student dashboard page"

# Push
git push origin feature/add-student-dashboard

# When done, merge to your personal branch
git checkout varshitha
git merge feature/add-student-dashboard
git push origin varshitha
```

---

**Remember:** Commit frequently! Each meaningful UI change = a new commit.
