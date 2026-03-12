# Project Structure Visual Map

```
wt-project/
│
├── 📁 backend/                          BACKEND TEAM (Vivek, Srilatha)
│   └── src/
│       ├── server.ts                   ← Express server entry
│       ├── routes/                     ← API endpoints
│       │   ├── auth.ts                (Vivek)
│       │   ├── users.ts               (Vivek)
│       │   ├── students.ts            (Srilatha)
│       │   ├── companies.ts
│       │   └── interviews.ts
│       ├── controllers/               ← Request handlers
│       │   ├── authController.ts      (Vivek)
│       │   ├── userController.ts
│       │   ├── studentController.ts   (Srilatha)
│       │   └── companyController.ts
│       ├── models/                    ← Database schemas
│       │   ├── User.ts
│       │   ├── Student.ts
│       │   ├── Company.ts
│       │   └── Interview.ts
│       ├── middleware/               ← Auth & validation
│       │   ├── auth.ts               (Vivek)
│       │   └── errorHandler.ts
│       └── services/                 ← Database operations
│           ├── userService.ts        (Vivek)
│           └── studentService.ts     (Srilatha)
│
│
├── 📁 frontend/                        FRONTEND TEAM (Varshitha, NavyaSri)
│   ├── src/
│   │   ├── App.tsx                   ← Root component (Varshitha)
│   │   ├── main.tsx                  ← Entry point
│   │   ├── pages/                    ← Page components (Varshitha)
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── CompanyDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── StudentProfileView.tsx
│   │   │   ├── StudentSearch.tsx
│   │   │   ├── ExploreCompanies.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── AdminLoginPage.tsx
│   │   ├── components/               ← Reusable components (NavyaSri)
│   │   │   ├── Layout.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── services/
│   │   │   └── api.ts               ← API calls to backend
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   └── styles/                  ← CSS files (NavyaSri)
│   │       ├── index.css
│   │       └── tailwind.css
│   ├── index.html
│   ├── vite.config.ts
│   └── README.md                    ← Frontend guide
│
│
├── 📁 features/                        SPECIAL FEATURES TEAM (Jessy)
│   │
│   ├── 📂 ai-integration/
│   │   └── src/
│   │       ├── aiService.ts         ← Gemini API integration (Jessy)
│   │       └── types.ts
│   │
│   ├── 📂 interview-mode/
│   │   └── src/
│   │       ├── pages/
│   │       │   └── InterviewRoom.tsx ← Interview UI (Jessy)
│   │       ├── components/
│   │       │   ├── VideoWindow.tsx   ← Video display (Jessy)
│   │       │   ├── Controls.tsx      ← Camera/mic controls (Jessy)
│   │       │   ├── ChatBox.tsx       ← Real-time chat (Jessy)
│   │       │   └── ScreenShare.tsx   ← Screen sharing (Jessy)
│   │       └── services/
│   │           ├── webrtc.ts        ← WebRTC setup (Jessy)
│   │           └── socket.ts        ← Socket.io (Jessy)
│   │
│   └── README.md                    ← Features guide
│
│
├── 📁 shared/                          Shared utilities & types
│   ├── types.ts                      ← Shared interfaces
│   ├── constants.ts                  ← Constants
│   └── utils.ts                      ← Utility functions
│
│
├── 📁 docs/                            Documentation folder
│   ├── API.md                        ← API reference
│   ├── ARCHITECTURE.md               ← System design
│   ├── DATABASE.md                   ← DB schema
│   └── DEPLOYMENT.md                 ← Deployment guide
│
│
├── 📄 PROJECT_STRUCTURE.md             ← Overview of structure
├── 📄 TEAM_WORKFLOW.md                 ← Collaboration guide
├── 📄 STRUCTURE_READY.md               ← Setup completion guide
├── 📄 README.md                        ← Main project README
├── 📄 package.json                     ← Root dependencies
├── 📄 tsconfig.json                    ← TypeScript config
├── 📄 vite.config.ts                   ← Build config
└── 📄 server.ts                        ← Entry point (legacy)


LEGEND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 = Folder (Team's domain)
📂 = Subfolder (Feature module)
📄 = Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Employee Distribution

### BACKEND (2 people)
```
backend/src/
├── Vivek (Lead)
│   ├── Handles: Server, Auth, Database
│   ├── Files: server.ts, auth routes, middleware
│   └── Status: ⏳ To Start
│
└── Srilatha (Support)
    ├── Handles: Student Endpoints, Profiles
    ├── Files: student routes, student service
    └── Status: ⏳ To Start
```

### FRONTEND (2 people)
```
frontend/src/
├── Varshitha (Lead)
│   ├── Handles: Pages, Routing, Layout
│   ├── Files: pages/*.tsx, App.tsx
│   └── Status: ⏳ To Start
│
└── NavyaSri (Support)
    ├── Handles: Styling, Components
    ├── Files: components/*.tsx, styles/*.css
    └── Status: ⏳ To Start
```

### SPECIAL FEATURES (1 person)
```
features/
└── Jessy (Solo Developer)
    ├── Handles: AI Integration, Interview Room
    ├── Files: ai-integration/, interview-mode/
    └── Status: ⏳ To Start
```

---

## 🎯 First Task for Each Person

### Vivek:
```bash
cd backend/src
# Task: Implement authentication route
# File: routes/auth.ts
# Create: POST /api/auth/register endpoint
```

### Srilatha:
```bash
cd backend/src
# Task: Create student profile endpoints
# File: routes/students.ts
# Create: GET /api/students, POST /api/students/search
```

### Varshitha:
```bash
cd frontend/src
# Task: Build page layouts
# Files: pages/*.tsx
# Create: Page structure and routing
```

### NavyaSri:
```bash
cd frontend/src
# Task: Style components with Tailwind
# Files: components/*.tsx, styles/
# Create: Reusable styled components
```

### Jessy:
```bash
cd features
# Task: AI service && Interview room
# Files: ai-integration/src/, interview-mode/src/
# Create: Gemini API integration, WebRTC setup
```

---

## ✅ Organization Complete!

Everything is ready for your 5-person team to work efficiently:

✓ **Clear Folder Separation** - Each team has their own folder  
✓ **Well-Documented** - Guides for each team  
✓ **Minimal Conflicts** - Teams don't overlap  
✓ **Professional Structure** - Industry-standard layout  
✓ **Easy to Scale** - Add more features/teams easily  

**Next Step:** Read your team's README and start coding! 🚀
