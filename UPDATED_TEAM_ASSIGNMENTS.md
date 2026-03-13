# 📋 UPDATED TEAM ASSIGNMENTS - March 12, 2026

## 🔄 CHANGES MADE

The team tasks have been reorganized to better utilize skills and balance workload:

---

## 👥 NEW TEAM STRUCTURE (6 Members)

```
wt-project/
│
├─ BACKEND TEAM (2 members) 🖥️
│  ├─ Prathima (Lead) - API Design, Routes, Controllers
│  └─ NavyaSri (Support) - Database, Services, Models
│  └─ Working in: backend/src/
│
├─ FRONTEND TEAM (2 members) 🎨
│  ├─ Varshitha (Lead) - Pages, Routing, Page Structure
│  └─ Jessy (Developer) - Components, Styling, UI/UX
│  └─ Working in: frontend/src/
│
├─ SPECIAL FEATURES TEAM (1 member) 🤖
│  └─ Vivek (Solo) - AI Integration, Interview Room, WebRTC
│  └─ Working in: features/
│
└─ TESTING & QA TEAM (1 member) ✅
   └─ Srilatha (QA Lead) - Testing, Bug Finding, Integration Verification
   └─ Can work across: backend/, frontend/, features/
```

---

## 📊 DETAILED ROLE BREAKDOWN

### **VIVEK** - Special Features Developer 🤖
**Primary Folder:** `features/`

**Responsibilities:**
- ✅ Google Gemini AI API integration
- ✅ Interview question generation
- ✅ AI-powered feedback generation
- ✅ Resume analysis with AI
- ✅ WebRTC video peer connections
- ✅ Socket.io real-time communication setup
- ✅ Interview room implementation
- ✅ Recording and streaming features

**Key Files:**
- `features/ai-integration/src/aiService.ts`
- `features/interview-mode/src/services/webrtc.ts`
- `features/interview-mode/src/services/socket.ts`
- `features/interview-mode/src/pages/InterviewRoom.tsx`

**Commits Should Include:**
```
feat: integrate Gemini API for question generation
feat: implement WebRTC peer connection
feat: setup Socket.io event handlers
feat: add interview room controls
```

---

### **PRATHIMA** - Backend Lead 🖥️
**Primary Folder:** `backend/src/`

**Responsibilities:**
- ✅ Design REST API architecture
- ✅ Create API routes (`backend/src/routes/`)
- ✅ Build route controllers (`backend/src/controllers/`)
- ✅ Handle errors and validation
- ✅ Design database relationships
- ✅ Setup middleware
- ✅ OAuth/JWT implementation
- ✅ API endpoint coordination

**Key Files:**
- `backend/src/routes/*.ts`
- `backend/src/controllers/*.ts`
- `backend/src/middleware/*.ts`

**Commits Should Include:**
```
feat: create user authentication routes
feat: implement company job posting endpoints
feat: setup API middleware and validation
feat: create database relationship schema
refactor: optimize API request handlers
```

---

### **VARSHITHA** - Frontend Lead 🎨
**Primary Folder:** `frontend/src/`

**Responsibilities:**
- ✅ Design and validate routing structure (`App.tsx`)
- ✅ Create page layouts and structure
- ✅ Component integration strategy
- ✅ Frontend-backend API integration
- ✅ State management across pages
- ✅ Overall frontend architecture
- ✅ Page component organization
(Database & Services) 💾
**Primary Folder:** `backend/src/`

**Responsibilities:**
- ✅ Build database models and schemas
- ✅ Create service layer functions
- ✅ Database query optimization
- ✅ Handle data validation
- ✅ Implement CRUD operations
- ✅ User profile management
- ✅ Student profile functionality
- ✅ Company data management

**Key Files:**
- `backend/src/models/*.ts` (Database schemas)
- `backend/src/services/*.ts` (Business logic)
- `backend/src/routes/students.ts`
- `backend/src/routes/companies.ts`

**Commits Should Include:**
```
feat: create student profile database model
feat: implement student search service
feat: add database validation for user data
feat: create company management service
- ✅ Implement CRUD operations
- ✅ User profile management
- ✅ Student profile endpoints
- ✅ Company data management

**Key Files:**
- `backend/src/models/*.ts` (Database schemas)
- `backend/src/services/*.ts` (Business logic)
- `backend/src/routes/students.ts`
- `backend/src/routes/companies.ts`

**Commits Should Include:**
```
feat: create student profile database model
feat: implement student search service
feat: add database validation for user data
feat: create company management endpoints
fix: optimize database query performance
```

---

### **JESSY** - Frontend Developer (Components & Styling) 🎨
**Primary Folder:** `frontend/src/`

**Responsibilities:**
- ✅ Build React components (buttons, cards, modals, etc.)
- ✅ Stylesheet management and Tailwind CSS
- ✅ Responsive design implementation
- ✅ UI/UX polish and animations
- ✅ Form handling and validation
- ✅ Component prop management
- ✅ Reusable component library
- ✅ styling consistency

**Key Files:**
- `frontend/src/components/*.tsx` (Reusable components)
- `frontend/src/styles/*.css` (Styling)
- `frontend/src/pages/*.tsx` (Component integration)

**Components to Build:**
```
Button, Card, Modal, Input, Select, Form
Navbar, Footer, Layout, Loading, Error
StudentCard, CompanyCard, JobCard
```

**Commits Should Include:**
```
feat: create reusable button component
feat: build form input component with validation
style: add responsive design for mobile
feat: implement modal component
style: improve component styling with Tailwind
```

---

### **SRILATHA** - QA & Testing Lead ✅
**Domain:** Can work across all folders for testing

**Responsibilities:**
- ✅ Write and execute test cases
- ✅ Find and report bugs
- ✅ Verify backend API functionality
- ✅ Test frontend user flows
- ✅ Integration testing (frontend ↔ backend)
- ✅ Special features testing (AI, WebRTC)
- ✅ Performance testing
- ✅ User acceptance testing (UAT)
- ✅ Create bug reports with details
- ✅ Modify and fix bugs found

**Testing Areas:**
```
Backend APIs:
- Auth endpoints (register, login, logout)
- Student profile endpoints
- Company endpoints
- Interview endpoints

Frontend Features:
- Landing page functionality
- User authentication flow
- Dashboard navigation
- Form submissions

Integration:
- API calls work correctly
- Data flows from backend to frontend
- Authentication persists

Special Features:
- Interview room video works
- AI generates questions
- Chat functionality
- Recording features
```

**When Finding Bugs:**
```
1. Create a bug report documenting:
   - What went wrong
   - Steps to reproduce
   - Expected vs actual behavior

2. Create feature branch: bug/fix-<issue-name>

3. Fix the issue

4. Commit: "fix: resolve <issue-name> as reported in testing"

5. Merge back to your personal branch
```

**Commits Should Include:**
```
test: verify authentication flow end-to-end
test: validate student search functionality
fix: resolve login token expiration issue
test: check responsive design on mobile
fix: fix form validation errors
test: verify WebRTC connection in interview room
```

---

## 🔄 WORKFLOW CHANGES

### For Vivek:
```
BEFORE: Backend team member (auth, APIs)
NOW: Special features solo developer (AI, WebRTC)

Focus: AI Integration + Interview Room
Folder: features/
Commits: 5-10 per feature (AI, WebRTC, Interview)
```

### For Varshitha:
```
BEFORE: Frontend lead (pages, routing)
NOW: Backend lead + Frontend co-lead (APIs + Pages)

Focus: Backend API design + Frontend routing
Folders: backend/src/ + frontend/src/
Commits: Distributed across backend and frontend
Bridge: Connect backend APIs with frontend pages
```

### For NavyaSri:
```
BEFORE: Frontend support (styling, components)
NOW: Backend developer (database, services)

Focus: Database models + Service logic
Folder: backend/src/ (models, services)
Commits: 5-10 per feature (endpoints, schemas)
```

### For Jessy:
```
BEFORE: Special features developer (AI, WebRTC)
NOW: Frontend developer (components, pages)

Focus: React components + Page implementation
Folder: frontend/src/ (components, pages, styling)
Commits: 5-10 per component/page
```

### For Srilatha:
```
BEFORE: Backend support (student endpoints)
NOW: QA & Testing lead

Focus: Testing across all modules
Folders: Can access backend/, frontend/, features/
Role: Find bugs, verify functionality, create test reports
Action: Fix bugs found through testing
```

---

## 📋 NEW TASK FLOW

### Week 1-2: Foundation
- **Vivek:** Setup AI service + interview room skeleton
- **Varshitha:** Design backend routes + frontend structure
- **NavyaSri:** Create database models + services
- **Jessy:** Build core UI components
- **Srilatha:** Test each component as completed

### Week 2-3: Development
- **Vivek:** Complete AI integration + WebRTC
- **Varshitha:** Complete APIs + integrate frontend
- **NavyaSri:** Complete services + optimize queries
- **Jessy:** Complete pages + styling
- **Srilatha:** Full integration testing

### Week 3-4: Polish & Final Testing
- **All:** Fix bugs found by Srilatha
- **Srilatha:** Final UAT + performance testing
- **All:** Optimize and deploy

---

## ✅ Expected Commits Per Person

| Person | Folder(s) | Expected Commits | Examples |
|--------|-----------|-----------------|----------|
| **Prathima** | `backend/` | 10-15 | Routes, controllers, middleware |
| **NavyaSri** | `backend/` | 10-15 | Models, services, database logic |
| **Varshitha** | `frontend/` | 10-15 | Pages, routing, page layouts |
| **Jessy** | `frontend/` | 10-15 | Components, styling |
| **Vivek** | `features/` | 10-15 | AI service, WebRTC, Interview room |
| **Srilatha** | All | 5-10 | Tests, bug fixes, test reports |

---

## 🎯 Immediate Next Steps

1. **Prathima:**
   ```bash
   cd backend/src/
   # Start: Design and create auth routes
   # File: routes/auth.ts, controllers/authController.ts
   ```

2. **NavyaSri:**
   ```bash
   cd backend/src/
   # Create: user model, student model
   # Create: userService, studentService
   ```

3. **Varshitha:**
   ```bash
   cd frontend/src/
   # Setup: App.tsx routing
   # Create: Page layouts and structure
   ```

4. **Jessy:**
   ```bash
   cd frontend/src/
   # Create: Button, Card, Input components
   # Create: Styling with Tailwind
   ```

5. **Vivek:**
   ```bash
   cd features/
   # Start: AI service module setup
   # File: features/ai-integration/src/aiService.ts
   ```

6. **Srilatha:**
   ```bash
   # Test each component as others complete
   # Report issues found
   # Fix bugs in respective folders
   `Prathima's Commits:
```
git commit -m "feat: create user authentication routes"
git commit -m "feat: setup JWT middleware"
git commit -m "feat: create company endpoints"
```

### NavyaSri's Commits:
```
git commit -m "feat: create User database model"
git commit -m "feat: implement user service functions"
git commit -m "feat: create student profile model"
```

### Varshitha's Commits:
```
git commit -m "feat: setup React Router configuration"
git commit -m "feat: create StudentDashboard page structure"
git commit -m "feat: implement API integration"
```

### Jessy's Commits:
```
git commit -m "feat: create Button component"
git commit -m "feat: build Form component with validation"
git commit -m "style: add responsive design"
```

### Vivek's Commits:
```
git commit -m "feat: setup Google Gemini API client"
git commit -m "feat: implement interview question generation"
git commit -m "feat: setup WebRTC peer connectio

### Jessy's Commits:
```
git commit -m "feat: create Button component"
git commit -m "feat: build StudentDashboard page"
git commit -m "style: add responsive design"
```

### Srilatha's Commits:
```
git commit -m "test: verify authentication flow"
git commit -m "fix: resolve login validation issue"
git commit -m "test: check API response times"
```

---

## ✨ Key Benefits of This Reorganization

✅ **Vivek focuses on innovation** - AI & WebRTC (specialized skills useful)  
✅ **Varshitha bridges teams** - Understands both backend and frontend  
✅ **NavyaSri strengthens backend** - Focus on database and logic layer  
✅ **Jessy focuses on UX** - Full frontend component and page development  
✅ **Srilatha ensures quality** - Testing and QA throughout development  
✅ **Cleaner separation** - Each person has clear, distinct responsibilities  
✅ **Better code quality** - Dedicated QA person catches issues early  
✅ **Team collaboration** - Srilatha communicates issues across teams  

---

## 📞 Reference Documents

- **PROJECT_STRUCTURE.md** - Updated project structure
- **FOLDER_MAP.md** - Visual folder layout
- **backend/README.md** - Backend team guide (now Varshitha & NavyaSri)
- **frontend/README.md** - Frontend team guide (now Varshitha & Jessy)
- **features/README.md** - Features guide (now Vivek)

---

**Assignment Update Date:** March 12, 2026  
**Updated by:** Vivek (on behalf of team reorganization)  
**Status:** ✅ Ready to implement
