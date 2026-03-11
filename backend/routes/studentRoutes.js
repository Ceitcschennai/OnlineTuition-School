// routes/studentRoutes.js

const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const Student = require("../models/Student");
const upload = require("../middleware/upload");
const transporter = require("../config/email");
const Activity = require("../models/Activity");

/* =================================================
   STUDENT REGISTER (DEFAULT: PENDING)
================================================= */
router.post("/register", upload.single("proof"), async (req, res) => {
  const {
    salutation,
    firstName,
    lastName,
    mobile,
    timezone,
    email,
    password,
    class: studentClass,
    group,
    syllabus,
    emisNumber
  } = req.body;

  const proof = req.file?.filename;

  try {
    /* ================================
       ✅ REQUIRED FIELD VALIDATION
    ================================= */
    if (
      !salutation ||
      !firstName ||
      !lastName ||
      !mobile ||
      !timezone ||
      !email ||
      !password ||
      !studentClass ||
      !syllabus ||
      !emisNumber
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    /* ================================
       ✅ EMAIL FORMAT VALIDATION
    ================================= */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    /* ================================
       🔐 STRONG PASSWORD VALIDATION
    ================================= */
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number and special character."
      });
    }

    /* ================================
       📁 FILE VALIDATION
    ================================= */
    if (!proof) {
      return res.status(400).json({
        message: "Student ID / Proof document is required"
      });
    }

    /* ================================
       📧 CHECK EXISTING EMAIL
    ================================= */
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    /* ================================
       🔐 HASH PASSWORD
    ================================= */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ================================
       💾 SAVE STUDENT
    ================================= */
    const newStudent = new Student({
      salutation,
      firstName,
      lastName,
      mobile,
      timezone,
      email,
      password: hashedPassword,
      class: studentClass,
      group,
      syllabus,
      emisNumber,
      proof,
      approvalStatus: "Pending",
      isActive: false
    });

    await newStudent.save();

    /* ================================
       🔥 ACTIVITY LOG
    ================================= */
    await Activity.create({
      type: "student",
      message: `New student registered: ${firstName} ${lastName}`,
      time: new Date()
    });

    /* ================================
       📧 EMAIL TO ADMIN (SAFE)
    ================================= */
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "New Student Registration Alert",
        html: `
          <h2>New Student Registered</h2>
          <p><b>Name:</b> ${firstName} ${lastName}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Class:</b> ${studentClass}</p>
          <p><b>Syllabus:</b> ${syllabus}</p>
          <p>Status: Pending Approval</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    /* ================================
       ✅ SUCCESS RESPONSE
    ================================= */
    res.status(201).json({
      success: true,
      message: "✅ Registration successful. Waiting for admin approval.",
      student: {
        id: newStudent._id,
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        email: newStudent.email,
        class: newStudent.class,
        approvalStatus: newStudent.approvalStatus
      }
    });

  } catch (err) {
    console.error("Student Registration Error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
});


/* =================================================
   ADMIN – GET ALL PENDING STUDENTS
================================================= */
router.get("/admin/pending", async (req, res) => {
  try {
    const students = await Student.find({ approvalStatus: "Pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      students
    });
  } catch (err) {
    console.error("Pending students error:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});


/* =================================================
   ADMIN – APPROVE / REJECT STUDENT
================================================= */
router.put("/admin/:id/approve", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: status,
        isActive: status === "Approved"
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    /* 📧 EMAIL TO STUDENT */
    try {
      await transporter.sendMail({
        to: student.email,
        subject: `Your Student Account is ${status}`,
        html: `
          <h2>Hello ${student.firstName},</h2>
          <p>Your account has been <b>${status}</b>.</p>
          ${
            status === "Approved"
              ? "<p>You can now login and start learning 🎉</p>"
              : "<p>Please contact admin for more details.</p>"
          }
        `
      });
    } catch (emailError) {
      console.error("Approval email failed:", emailError);
    }

    /* 🔥 ACTIVITY LOG */
    await Activity.create({
      type: "student",
      message: `Student ${student.firstName} ${student.lastName} was ${status}`,
      time: new Date()
    });

    res.json({
      success: true,
      message: `Student ${status.toLowerCase()} successfully`,
      student
    });

  } catch (err) {
    console.error("Student approval error:", err);
    res.status(500).json({ message: "Approval failed" });
  }
});


/* =================================================
   STUDENT DASHBOARD
================================================= */
router.get("/:id/dashboard", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const Teacher = require("../models/Teacher");

    const assignedTeachers = await Teacher.find({
      classesAssigned: student.class,
      isApproved: true
    });

    const enrolledSubjects = [];
    assignedTeachers.forEach(t => {
      t.subjects?.forEach(s => {
        if (!enrolledSubjects.includes(s)) {
          enrolledSubjects.push(s);
        }
      });
    });

    const stats = {
      enrolledSubjects: enrolledSubjects.length,
      pendingAssignments: 0,
      completedAssignments: 0,
      attendance: 0,
      lastPayment: student.status === "Paid" ? "Paid" : "Pending"
    };

    res.json({
      success: true,
      stats,
      enrolledSubjectsList: enrolledSubjects,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        class: student.class,
        approvalStatus: student.approvalStatus
      }
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});


/* =================================================
   GET SINGLE STUDENT
================================================= */
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch student" });
  }
});

module.exports = router;
