const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const ClassSession = require("../models/ClassSession");
const Teacher = require("../models/Teacher");
const Activity = require("../models/Activity");
const transporter = require("../config/email");

/* =========================
   ENSURE UPLOADS FOLDER
========================= */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================
   TEACHER REGISTER
========================= */
router.post(
  "/register",
  upload.single("degreeCertificate"),
  async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (!email || !password) {
  return res.status(400).json({ message: "Email and password required" });
}

// 🔐 Strong Password Validation
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
  });
}


      const exists = await Teacher.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ message: "Teacher already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const teacher = new Teacher({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        degreeCertificate: req.file?.path || "",
        isApproved: false
      });

      await teacher.save();

      await Activity.create({
        type: "teacher",
        message: `New teacher registered: ${teacher.firstName} ${teacher.lastName}`,
        time: new Date()
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "New Teacher Registration",
        html: `
          <h2>New Teacher Registered</h2>
          <p><b>Name:</b> ${firstName} ${lastName}</p>
          <p><b>Email:</b> ${email}</p>
          <p>Status: Pending Approval</p>
        `
      });

      res.status(201).json({
        success: true,
        message: "Teacher registered successfully. Waiting for admin approval."
      });

    } catch (err) {
      console.error("TEACHER REGISTER ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   GET PENDING TEACHERS ✅
========================= */
router.get("/admin/pending", async (req, res) => {
  try {
    const teachers = await Teacher.find({ isApproved: false });
    res.json({ teachers });
  } catch (err) {
    console.error("Fetch pending teachers error:", err);
    res.status(500).json({ message: "Failed to fetch pending teachers" });
  }
});

/* =========================
   APPROVE / REJECT TEACHER
========================= */
router.put("/admin/teacher/:id/approve", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: status === "Approved",
        approvalStatus: status
      },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await transporter.sendMail({
      to: teacher.email,
      subject: `Your Teacher Account is ${status}`,
      html: `
        <h2>Hello ${teacher.firstName},</h2>
        <p>Your teacher account has been <b>${status}</b>.</p>
        ${
          status === "Approved"
            ? "<p>You can now login and start teaching 👨‍🏫👩‍🏫</p>"
            : "<p>Please contact admin for more details.</p>"
        }
      `
    });

    await Activity.create({
      type: "teacher",
      message: `Teacher ${teacher.firstName} ${teacher.lastName} was ${status}`,
      time: new Date()
    });

    res.json({
      success: true,
      message: `Teacher ${status.toLowerCase()} successfully`,
      teacher
    });

  } catch (err) {
    console.error("Teacher approval error:", err);
    res.status(500).json({ message: "Approval failed" });
  }
});

/* =========================
   TEACHER DASHBOARD STATS
========================= */
router.get("/dashboard/stats/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId)
      .populate("subjects", "name");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Example Stats (you can improve later)
    const totalStudents = 0; // you can calculate based on classes
    const assignmentsToReview = 0;
    const pendingQueries = 0;
    const attendanceRate = 85; // demo value

    const recentActivities = await Activity.find({ type: "teacher" })
      .sort({ time: -1 })
      .limit(5);

    res.json({
      stats: {
        totalStudents,
        assignmentsToReview,
        pendingQueries,
        attendanceRate
      },
      teacherInfo: {
        name: teacher.firstName + " " + teacher.lastName,
        classes: teacher.classesAssigned || [],
        subjects: teacher.subjects.map(s => s.name)
      },
      recentActivities
    });

  } catch (err) {
    console.error("Teacher dashboard error:", err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});
/* =========================
   GET TEACHER SUBJECTS
========================= */
router.get("/subjects/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId)
      .populate("subjects", "name category classes");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
        code: "TEACHER_NOT_FOUND"
      });
    }

    if (!teacher.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Account not approved yet",
        code: "NOT_APPROVED"
      });
    }

    res.json({
      success: true,
      subjects: teacher.subjects || []
    });

  } catch (err) {
    console.error("Fetch teacher subjects error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      code: "SERVER_ERROR"
    });
  }
});
/* =========================
   CREATE CLASS SESSION
========================= */
router.post("/create-class", async (req, res) => {
  try {
    const {
      teacherId,
      subjectId,
      title,
      description,
      meetLink,
      classDate,
      durationMinutes
    } = req.body;

    if (!teacherId || !subjectId || !title || !meetLink || !classDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const session = await ClassSession.create({
      teacher: teacherId,
      subject: subjectId,
      title,
      description,
      meetLink,
      classDate,
      durationMinutes
    });

    res.status(201).json({
      success: true,
      message: "Class session created successfully",
      session
    });

  } catch (err) {
    console.error("Create class error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create class"
    });
  }
});
router.get("/my-classes/:teacherId", async (req, res) => {
  try {
    const sessions = await ClassSession.find({
      teacher: req.params.teacherId
    })
      .populate("subject", "name")
      .sort({ classDate: 1 });

    res.json({
      success: true,
      sessions
    });

  } catch (err) {
    console.error("Fetch classes error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes"
    });
  }
});
router.get("/student/classes", async (req, res) => {
  try {
    const sessions = await ClassSession.find({
      isActive: true
    })
      .populate("subject", "name")
      .populate("teacher", "firstName lastName")
      .sort({ classDate: 1 });

    res.json({
      success: true,
      sessions
    });

  } catch (err) {
    console.error("Student classes error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes"
    });
  }
});
module.exports = router;
