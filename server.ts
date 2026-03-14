import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";
import dotenv from "dotenv";
import { Server as SocketServer } from "socket.io";
import cors from "cors";

// Backend Imports
import connectDB from "./backend/src/config/database.js";
import authRoutes from "./backend/src/routes/authRoutes.js";
import jobRoutes from "./backend/src/routes/jobRoutes.js";
import appRoutes from "./backend/src/routes/appRoutes.js";
import interviewRoutes from "./backend/src/routes/interviewRoutes.js";
import userRoutes from "./backend/src/routes/userRoutes.js";
import adminRoutes from "./backend/src/routes/adminRoutes.js";
import notificationRoutes from "./backend/src/routes/notificationRoutes.js";
import competitionRoutes from "./backend/src/routes/competitionRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting server initialization...");

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

const io = new SocketServer(httpServer, {
  cors: { 
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Socket.io Logic for WebRTC signaling
const socketToRoom: Record<string, string> = {};
const roomToUsers: Record<string, string[]> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    console.log(`Socket ${socket.id} joining room: ${roomId}`);
    if (roomToUsers[roomId]) {
      roomToUsers[roomId].push(socket.id);
    } else {
      roomToUsers[roomId] = [socket.id];
    }
    socketToRoom[socket.id] = roomId;
    const usersInThisRoom = roomToUsers[roomId].filter(id => id !== socket.id);
    console.log(`Users in room ${roomId} (excluding self):`, usersInThisRoom);
    socket.emit("all-users", usersInThisRoom);
  });

  socket.on("sending-signal", payload => {
    console.log(`Sending signal from ${payload.callerID} to ${payload.userToSignal}`);
    io.to(payload.userToSignal).emit('user-joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on("returning-signal", payload => {
    console.log(`Returning signal from socket to ${payload.callerID}`);
    io.to(payload.callerID).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
  });
  
  socket.on("send-message", (payload) => {
    const roomId = socketToRoom[socket.id];
    io.to(roomId).emit("new-message", {
      text: payload.text,
      sender: payload.sender,
      id: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("update-scratchpad", (payload) => {
    const roomId = socketToRoom[socket.id];
    socket.to(roomId).emit("scratchpad-updated", payload);
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

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register Backend Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", appRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api", userRoutes); // students/search, students/:id, companies, profile
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/competitions", competitionRoutes);

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
  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
