# Team Collaboration & Workflow Guide

## 📊 Team Structure Overview

```
5 TEAM MEMBERS
│
├─ BACKEND TEAM (2 members)
│  ├─ Vivek (Lead) - Authentication, Database, API Design
│  └─ Srilatha (Support) - Student Profiles, Endpoints
│  └─ Working in: backend/src/
│
├─ FRONTEND TEAM (2 members)
│  ├─ Varshitha (Lead) - Pages, Routing, Layout
│  └─ NavyaSri (Support) - Styling, Components, UI/UX
│  └─ Working in: frontend/src/
│
└─ SPECIAL FEATURES TEAM (1 member)
   └─ Jessy (Solo) - AI Integration, Interview Room, WebRTC
   └─ Working in: features/
```

---

## 📁 Complete Project Structure

```
wt-project/
├── backend/                    # BACKEND TEAM domain
│   ├── src/
│   │   ├── server.ts          # Express server
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database schemas
│   │   ├── middleware/        # Auth, validation
│   │   └── services/          # Database operations
│   └── README.md              # Backend guide
│
├── frontend/                   # FRONTEND TEAM domain
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API calls
│   │   ├── lib/              # Utilities
│   │   └── styles/           # CSS/Tailwind
│   ├── index.html
│   ├── vite.config.ts
│   └── README.md              # Frontend guide
│
├── features/                   # SPECIAL FEATURES TEAM domain
│   ├── ai-integration/        # AI Service Module
│   │   └── src/
│   │       ├── aiService.ts
│   │       └── types.ts
│   │
│   ├── interview-mode/        # Interview Room Module
│   │   └── src/
│   │       ├── pages/
│   │       ├── components/
│   │       └── services/
│   │
│   └── README.md              # Features guide
│
├── shared/                     # Shared utilities
│   ├── types.ts              # Shared types
│   ├── constants.ts          # Constants
│   └── utils.ts              # Utilities
│
├── docs/                       # Project documentation
│   ├── API.md                # API reference
│   ├── ARCHITECTURE.md       # System design
│   ├── DATABASE.md           # DB schema
│   └── DEPLOYMENT.md         # Deployment guide
│
├── PROJECT_STRUCTURE.md        # This overview
├── README.md                   # Main README
├── package.json               # Root dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts            # Vite config
└── server.ts                  # Entry point (legacy)
```

---

## 🎯 Team Assignments in Detail

### **VIVEK & SRILATHA - Backend Team** 🖥️

**Location:** `backend/src/`

**Vivek's Tasks:**
1. Setup Express server (`backend/src/server.ts`)
2. Create authentication routes (`backend/src/routes/auth.ts`)
3. Build auth controller (`backend/src/controllers/authController.ts`)
4. Setup JWT & bcryptjs
5. Create user service (`backend/src/services/userService.ts`)
6. Database initialization

**Srilatha's Tasks:**
1. Student profile routes (`backend/src/routes/students.ts`)
2. Student controller (`backend/src/controllers/studentController.ts`)
3. Student service (`backend/src/services/studentService.ts`)
4. Search functionality
5. Profile management endpoints

**APIs to Create:**
```
POST   /api/auth/register        ← Vivek
POST   /api/auth/login           ← Vivek
POST   /api/auth/logout          ← Vivek
POST   /api/auth/refresh         ← Vivek

GET    /api/students             ← Srilatha
GET    /api/students/:id         ← Srilatha
PUT    /api/students/:id         ← Srilatha
POST   /api/students/search      ← Srilatha
```

---

### **VARSHITHA & NAVYASRI - Frontend Team** 🎨

**Location:** `frontend/src/`

**Varshitha's Tasks:**
1. Setup routing in `App.tsx`
2. Create page layouts:
   - LandingPage
   - AuthPage
   - StudentDashboard
   - CompanyDashboard
   - AdminDashboard
3. Basic component structure
4. Page navigation logic

**NavyaSri's Tasks:**
1. Styling with Tailwind CSS
2. Create UI components:
   - Button
   - Card
   - Modal
   - Form inputs
   - Navbar
   - Footer
3. Responsive design
4. Theme consistency

**Components to Build:**
```
frontend/src/pages/
├── LandingPage.tsx               ← Varshitha
├── AuthPage.tsx                  ← Varshitha
├── StudentDashboard.tsx          ← Varshitha
├── CompanyDashboard.tsx          ← Varshitha
├── AdminDashboard.tsx            ← Varshitha
└── ...other pages

frontend/src/components/
├── Navbar.tsx                    ← NavyaSri
├── Footer.tsx                    ← NavyaSri
├── Button.tsx                    ← NavyaSri
├── Card.tsx                      ← NavyaSri
├── FormInput.tsx                 ← NavyaSri
└── ...other components
```

---

### **JESSY - Special Features Team** 🎥

**Location:** `features/`

**Tasks:**
1. AI Integration Module (`features/ai-integration/`)
   - Integrate Google Gemini API
   - Generate interview questions
   - Analyze resumes
   - Generate feedback

2. Interview Room Module (`features/interview-mode/`)
   - Video streaming with WebRTC
   - Audio controls
   - Chat functionality
   - Screen sharing
   - Recording setup

**Components to Build:**
```
features/interview-mode/src/
├── pages/
│   └── InterviewRoom.tsx         ← Jessy
├── components/
│   ├── VideoWindow.tsx           ← Jessy
│   ├── Controls.tsx              ← Jessy
│   ├── ChatBox.tsx               ← Jessy
│   └── ScreenShare.tsx           ← Jessy
└── services/
    ├── webrtc.ts                 ← Jessy
    └── socket.ts                 ← Jessy
```

---

## 🚀 Getting Started (For Each Team Member)

### **All Team Members:**
```bash
# Clone and setup
git clone <repo>
cd wt-project
npm install
echo "GEMINI_API_KEY=your_key" > .env.local

# Checkout your branch
git checkout <your-branch>

# Pull latest
git pull origin <your-branch>
```

### **Backend Team (Vivek, Srilatha):**
```bash
# Read your guide
cat backend/README.md

# Look at your files
ls -la backend/src/

# Start development
npm run dev   # From root, or cd backend && npm run dev

# Your changes are in: backend/src/
```

### **Frontend Team (Varshitha, NavyaSri):**
```bash
# Read your guide
cat frontend/README.md

# Look at your files
ls -la frontend/src/

# Start development
npm run dev   # From root

# Your changes are in: frontend/src/
```

### **Features Team (Jessy):**
```bash
# Read your guide
cat features/README.md

# Look at your files
ls -la features/

# Start development
npm run dev   # From root

# Your changes are in: features/
```

---

## 📋 Daily Workflow

### **Morning - Start Work**
```bash
# Update your local branch
git pull origin <your-branch>

# See what changed
git status
```

### **During Day - Save Work Frequently**
```bash
# After implementing a feature/fix:
git add <your-folder>/
git commit -m "feat: description of what you did"
git push origin <branch>

# Create 5-10+ commits per day to show progress
```

### **After Feature Complete - Merge to Personal Branch**
```bash
# Finish feature branch
git checkout <your-branch>
git pull origin <your-branch>

# Merge your feature
git merge feature/<task>

# Push to remote
git push origin <your-branch>
```

---

## 📊 Commit Strategy for Marks

**Each commit = Visible contribution**

### Backend Team Examples:
```
git commit -m "feat: create authentication route"
git commit -m "feat: implement JWT token validation"
git commit -m "feat: create student search endpoint"
git commit -m "fix: handle database connection errors"
git commit -m "refactor: optimize database queries"
```

### Frontend Team Examples:
```
git commit -m "feat: create landing page layout"
git commit -m "feat: implement student dashboard"
git commit -m "style: add responsive design for mobile"
git commit -m "feat: create reusable button component"
git commit -m "fix: resolve form validation issues"
```

### Features Team Examples:
```
git commit -m "feat: integrate Google Gemini API"
git commit -m "feat: implement WebRTC video connection"
git commit -m "feat: add interview room controls"
git commit -m "feat: setup Socket.io for real-time chat"
git commit -m "feat: add AI-powered question generation"
```

**Target:** 10-20 commits per person by end of project

---

## 🔄 Collaboration Rules

### ✅ DO:
1. Commit frequently (daily)
2. Push regularly (multiple times per day)
3. Work only in your team's folder
4. Write clear commit messages
5. Ask before changing another team's code
6. Update imports if you move files
7. Test your changes locally
8. Document any special setup needed

### ❌ DON'T:
1. Wait until deadline to commit
2. Make giant commits with unrelated changes
3. Force push to main branch
4. Ignore merge conflicts
5. Skip commit messages
6. Modify another team's files without asking
7. Break other team's code
8. Commit without testing

---

## 🔗 Integration Points

**Where teams meet:**

| Team A | Meets | Team B | Where |
|--------|-------|--------|-------|
| **Backend** | ← API calls ← | **Frontend** | `frontend/src/services/api.ts` |
| **Backend** | ← requests ← | **Features** | `features/interview-mode/` |
| **Frontend** | ← components ← | **Features** | Interview Room in frontend |
| **All** | ← types ← | **Shared** | `shared/types.ts` |

**Backend provides:** REST APIs that other teams call  
**Frontend calls:** Backend APIs via axios  
**Features integrates:** With both other teams  

---

## 📞 Communication Checklist

Before merging to main:
- [ ] All tests pass (if applicable)
- [ ] Code follows team standards
- [ ] Commits are clear and organized
- [ ] No breaking changes to other teams' code
- [ ] Documentation is updated
- [ ] All team members understand the changes

---

## ✅ Milestones

### Week 1-2: Setup & Foundation
- [ ] Backend: Server + Auth + Basic APIs
- [ ] Frontend: Pages + Routing + Basic Components
- [ ] Features: AI Service + Interview Room skeleton

### Week 2-3: Core Features
- [ ] Backend: Complete all necessary endpoints
- [ ] Frontend: All pages styled and functional
- [ ] Features: WebRTC + Socket.io working

### Week 3-4: Integration & Polish
- [ ] All teams: Features integrated
- [ ] Testing: Everything works together
- [ ] Final polish: Performance, UX improvements

---

## 🎯 Success Criteria

✅ **Code Quality:**
- Clean, readable code
- Proper error handling
- Good performance

✅ **Collaboration:**
- Frequent commits (10+ per person)
- Clear commit messages
- Organized work in assigned folders

✅ **Features:**
- All assigned tasks completed
- Integration between teams working
- No breaking changes

✅ **Testing:**
- Features work as expected
- No major bugs
- User experience is smooth

---

## 📚 Quick Reference

| Role | Folder | Key Tasks |
|------|--------|-----------|
| **Vivek** | `backend/src/` | Auth, APIs, Database |
| **Srilatha** | `backend/src/` | Student endpoints |
| **Varshitha** | `frontend/src/` | Pages, Routing |
| **NavyaSri** | `frontend/src/` | Styling, Components |
| **Jessy** | `features/` | AI, Interview Room |

---

**Key Remember:** Each meaningful change = one commit. Commit frequently to show progress and earn marks! 🚀

Final checklist before starting:
- [ ] Read your team's README
- [ ] Understand your folder structure
- [ ] Know which files you'll edit
- [ ] Understand your specific tasks
- [ ] Setup local environment
- [ ] Make your first commit
- [ ] Start building!
