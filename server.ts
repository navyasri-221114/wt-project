import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Server as SocketServer } from "socket.io";
import http from "http";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting server initialization...");

let db: any;
try {
  db = new Database("placement.db");
  console.log("Database initialized successfully.");
} catch (err) {
  console.error("Failed to initialize database:", err);
  process.exit(1);
}

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS activation_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('student', 'company', 'admin')) NOT NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INTEGER PRIMARY KEY,
    department TEXT,
    branch TEXT,
    college TEXT,
    year INTEGER,
    cgpa REAL,
    skills TEXT,
    certifications TEXT,
    projects TEXT,
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    is_public INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS companies (
    user_id INTEGER PRIMARY KEY,
    description TEXT,
    website TEXT,
    location TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary TEXT,
    location TEXT,
    min_cgpa REAL,
    vacancies INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT DEFAULT 'applied',
    ai_score INTEGER DEFAULT 0,
    ai_feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id),
    FOREIGN KEY(student_id) REFERENCES users(id),
    UNIQUE(job_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    scheduled_at DATETIME NOT NULL,
    room_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'scheduled',
    recruiter_notes TEXT,
    evaluation_rating INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(application_id) REFERENCES applications(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const app = express();
const httpServer = http.createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: "*" }
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

app.use(express.json());

// Socket.io Logic for WebRTC signaling
const socketToRoom: Record<string, string> = {};
const roomToUsers: Record<string, string[]> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    if (roomToUsers[roomId]) {
      roomToUsers[roomId].push(socket.id);
    } else {
      roomToUsers[roomId] = [socket.id];
    }
    socketToRoom[socket.id] = roomId;
    const usersInThisRoom = roomToUsers[roomId].filter(id => id !== socket.id);
    socket.emit("all-users", usersInThisRoom);
  });

  socket.on("sending-signal", payload => {
    io.to(payload.userToSignal).emit('user-joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on("returning-signal", payload => {
    io.to(payload.callerID).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
  });

  socket.on("disconnect", () => {
    const roomId = socketToRoom[socket.id];
    let room = roomToUsers[roomId];
    if (room) {
      room = room.filter(id => id !== socket.id);
      roomToUsers[roomId] = room;
    }
    delete socketToRoom[socket.id];
  });
});

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, role, activationKey } = req.body;

  if (role === 'company') {
    if (!activationKey) {
      return res.status(400).json({ error: "Activation key is required for companies" });
    }
    const keyData: any = db.prepare("SELECT * FROM activation_keys WHERE key = ? AND status = 'active'").get(activationKey);
    if (!keyData) {
      return res.status(400).json({ error: "Invalid or inactive activation key" });
    }
    // Mark key as used
    db.prepare("UPDATE activation_keys SET status = 'used', assigned_to = ? WHERE key = ?").run(email, activationKey);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const info = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(name, email, hashedPassword, role);
    const userId = info.lastInsertRowid;
    
    if (role === 'student') {
      db.prepare("INSERT INTO student_profiles (user_id) VALUES (?)").run(userId);
    } else if (role === 'company') {
      db.prepare("INSERT INTO companies (user_id) VALUES (?)").run(userId);
    }

    const token = jwt.sign({ id: userId, role, name, email }, JWT_SECRET);
    res.json({ token, user: { id: userId, name, email, role } });
  } catch (err: any) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Hardcoded Admin Login
  const ADMIN_EMAIL = "admin@college.com";
  const ADMIN_PASS = "admin123";

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    const token = jwt.sign({ id: 0, role: 'admin', name: 'System Admin', email: ADMIN_EMAIL }, JWT_SECRET);
    return res.json({ token, user: { id: 0, name: 'System Admin', email: ADMIN_EMAIL, role: 'admin' } });
  }

  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url } });
});

// Profile
app.get("/api/profile", authenticate, (req: any, res) => {
  const user: any = db.prepare("SELECT id, name, email, role, avatar_url FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  let profile: any = {};
  if (user.role === 'student') {
    profile = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(req.user.id);
  } else if (user.role === 'company') {
    profile = db.prepare("SELECT * FROM companies WHERE user_id = ?").get(req.user.id);
  }
  res.json({ ...user, profile });
});

app.put("/api/profile", authenticate, (req: any, res) => {
  const { name, avatar_url, ...profileData } = req.body;
  db.prepare("UPDATE users SET name = ?, avatar_url = ? WHERE id = ?").run(name, avatar_url, req.user.id);
  
  if (req.user.role === 'student') {
    const { department, branch, college, year, cgpa, skills, certifications, projects, linkedin_url, github_url, is_public } = profileData;
    db.prepare(`
      UPDATE student_profiles SET 
      department = ?, branch = ?, college = ?, year = ?, cgpa = ?, skills = ?, certifications = ?, projects = ?, linkedin_url = ?, github_url = ?, is_public = ?
      WHERE user_id = ?
    `).run(department, branch, college, year, cgpa, skills, certifications, projects, linkedin_url, github_url, is_public ? 1 : 0, req.user.id);
  } else if (req.user.role === 'company') {
    const { description, website, location } = profileData;
    db.prepare("UPDATE companies SET description = ?, website = ?, location = ? WHERE user_id = ?").run(description, website, location, req.user.id);
  }
  res.json({ message: "Profile updated" });
});

// Jobs
app.get("/api/jobs", async (req, res) => {
  const jobs = db.prepare(`
    SELECT jobs.*, users.name as company_name 
    FROM jobs 
    JOIN users ON jobs.company_id = users.id
    WHERE jobs.status = 'open'
    ORDER BY created_at DESC
  `).all();
  res.json(jobs);
});

app.post("/api/jobs", authenticate, (req: any, res) => {
  if (req.user.role !== 'company' && req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { title, description, requirements, salary, location, min_cgpa, vacancies } = req.body;
  db.prepare(`
    INSERT INTO jobs (company_id, title, description, requirements, salary, location, min_cgpa, vacancies)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, title, description, requirements, salary, location, min_cgpa, vacancies || 1);
  res.json({ message: "Job posted" });
});

app.get("/api/jobs/my", authenticate, (req: any, res) => {
  const jobs = db.prepare("SELECT * FROM jobs WHERE company_id = ?").all(req.user.id);
  res.json(jobs);
});

// Applications
app.post("/api/applications", authenticate, async (req: any, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: "Forbidden" });
  const { job_id } = req.body;
  
  // Check eligibility
  const job: any = db.prepare("SELECT * FROM jobs WHERE id = ?").get(job_id);
  const student: any = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(req.user.id);
  
  if (student.cgpa < job.min_cgpa) {
    return res.status(400).json({ error: "You do not meet the minimum CGPA requirement for this job." });
  }

  // AI Scoring
  let ai_score = 70;
  let ai_feedback = "Good match based on skills.";

  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Analyze the following student profile and job description.
        Student Skills: ${student.skills}
        Student Projects: ${student.projects}
        Job Requirements: ${job.requirements}
        Job Description: ${job.description}
        
        Return a JSON object with:
        - score: (0-100)
        - feedback: (Short summary)
      `;
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }]
      });
      const text = result.text;
      const json = JSON.parse(text.replace(/```json|```/g, ""));
      ai_score = json.score;
      ai_feedback = json.feedback;
    } catch (e) {
      console.error("AI Scoring failed", e);
    }
  }

  try {
    db.prepare("INSERT INTO applications (job_id, student_id, ai_score, ai_feedback) VALUES (?, ?, ?, ?)").run(job_id, req.user.id, ai_score, ai_feedback);
    res.json({ message: "Application submitted" });
  } catch (err) {
    res.status(400).json({ error: "Already applied" });
  }
});

app.get("/api/applications/my", authenticate, (req: any, res) => {
  const apps = db.prepare(`
    SELECT applications.*, jobs.title, users.name as company_name
    FROM applications
    JOIN jobs ON applications.job_id = jobs.id
    JOIN users ON jobs.company_id = users.id
    WHERE applications.student_id = ?
  `).all(req.user.id);
  res.json(apps);
});

app.get("/api/applications/job/:jobId", authenticate, (req: any, res) => {
  const apps = db.prepare(`
    SELECT applications.*, users.name as student_name, student_profiles.cgpa, student_profiles.skills
    FROM applications
    JOIN users ON applications.student_id = users.id
    JOIN student_profiles ON users.id = student_profiles.user_id
    WHERE applications.job_id = ?
    ORDER BY ai_score DESC
  `).all(req.params.jobId);
  res.json(apps);
});

app.put("/api/applications/:id/status", authenticate, (req: any, res) => {
  const { status } = req.body;
  db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, req.params.id);
  
  // Notify student
  const app: any = db.prepare("SELECT student_id FROM applications WHERE id = ?").get(req.params.id);
  db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(app.student_id, `Your application status has been updated to: ${status}`);
  
  res.json({ message: "Status updated" });
});

// Interviews
app.post("/api/interviews", authenticate, (req: any, res) => {
  if (req.user.role !== 'company' && req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { application_id, scheduled_at } = req.body;
  const room_id = Math.random().toString(36).substring(2, 12);
  
  db.prepare(`
    INSERT INTO interviews (application_id, scheduled_at, room_id)
    VALUES (?, ?, ?)
  `).run(application_id, scheduled_at, room_id);

  // Update application status
  db.prepare("UPDATE applications SET status = 'shortlisted' WHERE id = ?").run(application_id);
  
  // Notify student
  const app: any = db.prepare("SELECT student_id FROM applications WHERE id = ?").get(application_id);
  db.prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)").run(app.student_id, `You have been shortlisted! Interview scheduled at: ${scheduled_at}`);

  res.json({ message: "Interview scheduled", room_id });
});

app.get("/api/interviews/my", authenticate, (req: any, res) => {
  let query = "";
  if (req.user.role === 'student') {
    query = `
      SELECT interviews.*, jobs.title, users.name as company_name
      FROM interviews
      JOIN applications ON interviews.application_id = applications.id
      JOIN jobs ON applications.job_id = jobs.id
      JOIN users ON jobs.company_id = users.id
      WHERE applications.student_id = ?
    `;
  } else {
    query = `
      SELECT interviews.*, jobs.title, users.name as student_name
      FROM interviews
      JOIN applications ON interviews.application_id = applications.id
      JOIN jobs ON applications.job_id = jobs.id
      JOIN users ON applications.student_id = users.id
      WHERE jobs.company_id = ?
    `;
  }
  const interviews = db.prepare(query).all(req.user.id);
  res.json(interviews);
});

app.get("/api/interviews/:roomId", authenticate, (req: any, res) => {
  const interview = db.prepare(`
    SELECT interviews.*, users.name as student_name, student_profiles.skills, student_profiles.projects, applications.ai_score, applications.ai_feedback
    FROM interviews
    JOIN applications ON interviews.application_id = applications.id
    JOIN users ON applications.student_id = users.id
    JOIN student_profiles ON users.id = student_profiles.user_id
    WHERE interviews.room_id = ?
  `).get(req.params.roomId);
  res.json(interview);
});

app.put("/api/interviews/:id/evaluate", authenticate, (req: any, res) => {
  if (req.user.role !== 'company' && req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { notes, rating, status } = req.body;
  db.prepare(`
    UPDATE interviews SET recruiter_notes = ?, evaluation_rating = ?, status = ?
    WHERE id = ?
  `).run(notes, rating, status, req.params.id);
  
  if (status === 'completed') {
    const interview: any = db.prepare("SELECT application_id FROM interviews WHERE id = ?").get(req.params.id);
    db.prepare("UPDATE applications SET status = 'interviewed' WHERE id = ?").run(interview.application_id);
  }
  
  res.json({ message: "Evaluation saved" });
});

// Activation Keys Management
app.get("/api/admin/keys", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const keys = db.prepare("SELECT * FROM activation_keys ORDER BY created_at DESC").all();
  res.json(keys);
});

app.post("/api/admin/keys", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const key = `COMP-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  db.prepare("INSERT INTO activation_keys (key) VALUES (?)").run(key);
  res.json({ key });
});

app.put("/api/admin/keys/:id/status", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { status } = req.body;
  db.prepare("UPDATE activation_keys SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ message: "Key status updated" });
});

// Student Search (for Admin and Companies)
app.get("/api/students/search", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'company') return res.status(403).json({ error: "Forbidden" });
  
  const { q, branch, college, year, skills, min_cgpa } = req.query;
  let query = `
    SELECT users.id, users.name, users.email, users.avatar_url, student_profiles.*
    FROM users
    JOIN student_profiles ON users.id = student_profiles.user_id
    WHERE users.role = 'student'
  `;
  
  const params: any[] = [];
  
  // Privacy filter: Companies can only see public profiles. Admin sees all.
  if (req.user.role === 'company') {
    query += " AND student_profiles.is_public = 1";
  }

  if (q) {
    query += " AND (users.name LIKE ? OR student_profiles.skills LIKE ? OR student_profiles.department LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (branch) {
    query += " AND student_profiles.branch LIKE ?";
    params.push(`%${branch}%`);
  }
  if (college) {
    query += " AND student_profiles.college LIKE ?";
    params.push(`%${college}%`);
  }
  if (year) {
    query += " AND student_profiles.year = ?";
    params.push(year);
  }
  if (skills) {
    query += " AND student_profiles.skills LIKE ?";
    params.push(`%${skills}%`);
  }
  if (min_cgpa) {
    query += " AND student_profiles.cgpa >= ?";
    params.push(parseFloat(min_cgpa));
  }

  const students = db.prepare(query).all(...params);
  res.json(students);
});

// Get Single Student Profile
app.get("/api/students/:id", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'company') return res.status(403).json({ error: "Forbidden" });
  
  const student: any = db.prepare(`
    SELECT users.id, users.name, users.email, users.avatar_url, student_profiles.*
    FROM users
    JOIN student_profiles ON users.id = student_profiles.user_id
    WHERE users.id = ? AND users.role = 'student'
  `).get(req.params.id);

  if (!student) return res.status(404).json({ error: "Student not found" });
  
  // Privacy check
  if (req.user.role === 'company' && student.is_public === 0) {
    return res.status(403).json({ error: "This profile is private" });
  }

  res.json(student);
});

// Explore Companies
app.get("/api/companies", authenticate, (req: any, res) => {
  const companies = db.prepare(`
    SELECT users.id, users.name, users.email, users.avatar_url, companies.*
    FROM users
    JOIN companies ON users.id = companies.user_id
    WHERE users.role = 'company'
  `).all();
  res.json(companies);
});

// Admin Stats
app.get("/api/admin/stats", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
  const totalCompanies = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'company'").get().count;
  const totalJobs = db.prepare("SELECT COUNT(*) as count FROM jobs").get().count;
  const totalApplications = db.prepare("SELECT COUNT(*) as count FROM applications").get().count;
  const totalInterviews = db.prepare("SELECT COUNT(*) as count FROM interviews").get().count;
  const placementRate = totalStudents > 0 ? (db.prepare("SELECT COUNT(DISTINCT student_id) as count FROM applications WHERE status = 'selected'").get().count / totalStudents) * 100 : 0;

  res.json({ totalStudents, totalCompanies, totalJobs, totalApplications, totalInterviews, placementRate });
});

// Vite Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Explicitly serve index.html for SPA fallback in dev
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log("Starting in production mode...");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  console.log(`Attempting to listen on port ${PORT}...`);
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
