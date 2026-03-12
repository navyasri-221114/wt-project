# Placement Platform - Project Structure

## 📁 Organized Directory Layout

```
wt-project/
├── backend/              👈 Backend Team (2 developers: Vivek, Srilatha)
├── frontend/             👈 Frontend Team (2 developers: Varshitha, NavyaSri)
├── features/             👈 Special Features (1 developer: Jessy)
├── shared/               👈 Shared utilities & types
├── docs/                 👈 Project documentation
└── package.json          👈 Root configuration
```

---

## 👥 Team Assignments & Folders

### **BACKEND TEAM** (2 developers)
📁 **Folder:** `backend/`

**Responsibilities:**
- ✅ Express server setup
- ✅ REST API endpoints
- ✅ Database models & queries
- ✅ Authentication & authorization
- ✅ User management

**Team Members:**
- Varshitha (Lead) - Routes, Controllers, Middleware
- NavyaSri (Support) - Models, Services, Database

**Key Files:**
- `backend/src/server.ts` - Main Express server
- `backend/src/routes/` - API endpoint definitions
- `backend/src/controllers/` - Route handlers
- `backend/src/models/` - Database schemas
- `backend/src/middleware/` - Auth, validation
- `backend/src/services/` - Database services

---

### **FRONTEND TEAM** (2 developers)
📁 **Folder:** `frontend/`

**Responsibilities:**
- ✅ React components
- ✅ Page layouts
- ✅ UI/UX implementation
- ✅ Frontend routing
- ✅ Stylesheet management

**Team Members:**
- Varshitha (Co-lead) - Routing, Pages, Integration
- Jessy (Developer) - Components, Styling, UI/UX

**Key Files:**
- `frontend/src/App.tsx` - Main app component
- `frontend/src/pages/` - Page components
- `frontend/src/components/` - Reusable components
- `frontend/src/services/` - API client calls
- `frontend/src/styles/` - CSS styling
- `frontend/src/lib/` - Utilities

---

### **SPECIAL FEATURES TEAM** (1 developer)
📁 **Folder:** `features/`

**Responsibilities:**
- ✅ AI integration (Gemini API)
- ✅ Interview question generation
- ✅ WebRTC configuration
- ✅ Real-time communication (Socket.io)
- ✅ Recording & streaming

**Team Member:**
- Vivek (Solo)

### **TESTING & QA TEAM** (1 developer)
**Responsibilities:**
- ✅ Test all features
- ✅ Find and report bugs
- ✅ Verify integrations
- ✅ Performance testing

**Team Member:**
- Srilatha (QA Lead)

**Sub-folders:**
- `features/ai-integration/` - AI service module
- `features/interview-mode/` - Interview room & WebRTC

---

### **SHARED UTILITIES**
📁 **Folder:** `shared/`

**Contains:**
- TypeScript interfaces & types
- Constants
- Shared utility functions
- Helper methods used by all teams

---

## 🚀 Quick Start

### For Backend Team
```bash
cd backend
npm install  # if separate package.json
npm run dev  # or use root npm run dev
# Edit files in: backend/src/
```

### For Frontend Team
```bash
cd frontend
npm install  # if separate package.json
# Edit files in: frontend/src/
```

### For Features Team
```bash
cd features/ai-integration  # or interview-mode
# Edit files respective folders
```

---

## 📊 File Organization

### Backend Structure
```
backend/
├── src/
│   ├── server.ts           # Express app initialization
│   ├── routes/             # API routes
│   │   ├── auth.ts        # Auth endpoints
│   │   ├── users.ts       # User endpoints
│   │   ├── students.ts    # Student endpoints
│   │   ├── companies.ts   # Company endpoints
│   │   └── interviews.ts  # Interview endpoints
│   ├── controllers/        # Route handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   └── ...
│   ├── models/            # Database schemas
│   │   ├── User.ts
│   │   ├── Student.ts
│   │   └── ...
│   ├── middleware/        # Auth, validation
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   └── services/          # Database logic
│       ├── userService.ts
│       └── studentService.ts
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   ├── pages/             # Page components
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── CompanyDashboard.tsx
│   │   └── ...
│   ├── components/        # Reusable components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── services/          # API calls
│   │   └── api.ts
│   ├── lib/               # Utilities
│   │   └── utils.ts
│   └── styles/            # CSS files
│       └── index.css
└── vite.config.ts
```

### Features Structure
```
features/
├── ai-integration/
│   └── src/
│       ├── aiService.ts       # Gemini API integration
│       └── types.ts           # AI-related types
│
└── interview-mode/
    └── src/
        ├── pages/
        │   └── InterviewRoom.tsx
        ├── components/
        │   ├── VideoWindow.tsx
        │   ├── Controls.tsx
        │   └── Chat.tsx
        └── services/
            ├── webrtc.ts      # WebRTC setup
            └── socket.ts      # Socket.io handlers
```

---

## 🔄 Working on the Project

### Backend Developer Workflow
```bash
cd backend

# Create a new API route
1. Create file in src/routes/
2. Create handler in src/controllers/
3. Register in src/server.ts
4. Test with curl or Postman

# Commit frequently
git add backend/
git commit -m "feat: add user authentication endpoint"
git push origin <your-branch>
```

### Frontend Developer Workflow
```bash
cd frontend

# Create a new page
1. Create file in src/pages/
2. Add route in App.tsx
3. Create components in src/components/ as needed
4. Style in src/styles/
5. Test in browser

# Commit frequently
git add frontend/
git commit -m "feat: add student dashboard page"
git push origin <your-branch>
```

### Features Developer Workflow
```bash
cd features

# Work on interview room
1. Update src/pages/InterviewRoom.tsx
2. Create components in src/components/
3. Add WebRTC logic in src/services/

# Work on AI integration
1. Update src/aiService.ts
2. Test with sample prompts

# Commit frequently
git add features/
git commit -m "feat: implement video connection in interview room"
git push origin <your-branch>
```

---

## ✅ Advantages of This Structure

✅ **Clear Separation** - Each team knows exactly where to work  
✅ **Minimal Conflicts** - Teams work in different folders  
✅ **Easy Onboarding** - New members know where to look  
✅ **Scalable** - Easy to add more modules later  
✅ **Independent Commits** - Each team commits organized changes  
✅ **Code Organization** - Logical grouping by responsibility  

---

## 📝 Development Notes

- Keep commits focused to your team's folder
- Don't modify other team's files without communication
- Use shared/ folder for common utilities
- Document new modules with README files in each folder
- Update imports if moving files around

---

**Last Updated:** March 12, 2026  
**Created for:** 5-member collaborative project
