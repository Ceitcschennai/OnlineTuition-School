require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// ================= CREATE UPLOAD FOLDERS =================
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}
if (!fs.existsSync("uploads/assignments")) {
  fs.mkdirSync("uploads/assignments", { recursive: true });
}

const app = express();
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = socketIo(server, {
  cors: {
    origin: [
      "https://online-tutor-frontend-gamma.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ================= MIDDLEWARE =================
app.use(cors({
  origin: [
    "https://online-tutor-frontend-gamma.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static("uploads"));


// ================= BASE ROUTE =================
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/queries", require("./routes/queryRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/live-classes", require("./routes/liveClassRoutes"));
app.use("/api", require("./routes/attendanceRoutes"));

// Make socket available in routes
app.set("io", io);

// ================= SOCKET HANDLER =================
const socketHandler = require("./socket/socketHandler");
socketHandler(io);

// ================= START SERVER =================

// 🔥 FORCE backend to use port 5000
const PORT = 5000;

server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
