const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require('fs');
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

if (!fs.existsSync('uploads/assignments')) {
  fs.mkdirSync('uploads/assignments', { recursive: true });
}

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      "https://online-tutor-frontend-gamma.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});

// CORS configuration
app.use(cors({
  origin: [
    "https://online-tutor-frontend-gamma.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());
app.use(express.raw({ type: 'application/json' })); // For sendBeacon

// Sample route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Make io accessible to routes
app.set('io', io);

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const studentRoutes = require("./routes/studentRoutes");
app.use('/api/student', studentRoutes);
app.use('/api/students', studentRoutes); // ✅ Add this for /api/students/by-class

const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/teacher', teacherRoutes);
app.use('/api/teachers', teacherRoutes); // ✅ Add this for consistency

const LoginRoute = require('./routes/LoginRoute');
app.use('/api/auth', LoginRoute);

const subjectRoutes = require('./routes/subjectRoutes');
app.use('/api/subjects', subjectRoutes);

const queryRoutes = require('./routes/queryRoutes');
app.use('/api/queries', queryRoutes);

const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignments', assignmentRoutes);

const liveClassRoutes = require('./routes/liveClassRoutes');
app.use('/api/live-classes', liveClassRoutes);

const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api', attendanceRoutes); // ✅ This enables /api/attendance/* routes

app.use("/uploads", express.static("uploads"));

// Socket.IO connection handling
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
