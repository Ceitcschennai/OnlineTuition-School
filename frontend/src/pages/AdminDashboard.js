import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";
import "../styles/adminDashboard.css";

const AdminDashboard = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchPendingStudents();
    fetchPendingTeachers();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/students/admin/pending`
      );

      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();
      setPendingStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      setPendingStudents([]);
    }
  };

  const fetchPendingTeachers = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/teachers/admin/pending`
      );

      if (!res.ok) throw new Error("Failed to fetch teachers");

      const data = await res.json();
      setPendingTeachers(Array.isArray(data.teachers) ? data.teachers : []);
    } catch (err) {
      console.error("Error fetching teachers:", err.message);
      setPendingTeachers([]);
    }
  };

  /* ================= APPROVAL LOGIC ================= */

  const handleStudentApproval = async (status) => {
    if (!selectedStudent) return;

    if (status === "Rejected" && !rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/students/admin/${selectedStudent._id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            reason: status === "Rejected" ? rejectReason : ""
          })
        }
      );

      if (!res.ok) throw new Error("Failed to update student");

      const data = await res.json();
      alert(data.message || "Student updated successfully");

      resetState();
      fetchPendingStudents();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherApproval = async (status) => {
    if (!selectedTeacher) return;

    if (status === "Rejected" && !rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/teachers/admin/teacher/${selectedTeacher._id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            reason: status === "Rejected" ? rejectReason : ""
          })
        }
      );

      if (!res.ok) throw new Error("Failed to update teacher");

      const data = await res.json();
      alert(data.message || "Teacher updated successfully");

      resetState();
      fetchPendingTeachers();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSelectedStudent(null);
    setSelectedTeacher(null);
    setRejectReason("");
  };

  /* ================= UI ================= */

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* STUDENTS */}
      <h2>Pending Students</h2>

      {pendingStudents.length === 0 ? (
        <p>No pending students</p>
      ) : (
        pendingStudents.map((student) => (
          <div
            key={student._id}
            className="card"
            onClick={() => {
              setSelectedStudent(student);
              setSelectedTeacher(null);
              setRejectReason("");
            }}
          >
            <strong>
              {student.firstName} {student.lastName}
            </strong>{" "}
            ({student.email})
          </div>
        ))
      )}

      {selectedStudent && (
        <div className="detail-box">
          <h3>Student Details</h3>
          <p><strong>First Name:</strong> {selectedStudent.firstName}</p>
          <p><strong>Last Name:</strong> {selectedStudent.lastName}</p>
          <p><strong>Email:</strong> {selectedStudent.email}</p>
          <p><strong>Phone:</strong> {selectedStudent.phone}</p>
          <p><strong>Grade:</strong> {selectedStudent.grade}</p>
          <p><strong>School:</strong> {selectedStudent.school}</p>

          <div className="button-group">
            <button
              disabled={loading}
              onClick={() => handleStudentApproval("Approved")}
              className="approve-btn"
            >
              {loading ? "Processing..." : "Approve"}
            </button>
          </div>

          <div className="reject-section">
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="3"
            />
            <button
              disabled={loading}
              onClick={() => handleStudentApproval("Rejected")}
              className="reject-btn"
            >
              {loading ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>
      )}

      {/* TEACHERS */}
      <h2>Pending Teachers</h2>

      {pendingTeachers.length === 0 ? (
        <p>No pending teachers</p>
      ) : (
        pendingTeachers.map((teacher) => (
          <div
            key={teacher._id}
            className="card"
            onClick={() => {
              setSelectedTeacher(teacher);
              setSelectedStudent(null);
              setRejectReason("");
            }}
          >
            <strong>
              {teacher.firstName} {teacher.lastName}
            </strong>{" "}
            ({teacher.email})
          </div>
        ))
      )}

      {selectedTeacher && (
        <div className="detail-box">
          <h3>Teacher Details</h3>
          <p><strong>First Name:</strong> {selectedTeacher.firstName}</p>
          <p><strong>Last Name:</strong> {selectedTeacher.lastName}</p>
          <p><strong>Email:</strong> {selectedTeacher.email}</p>
          <p><strong>Phone:</strong> {selectedTeacher.phone}</p>
          <p><strong>Qualification:</strong> {selectedTeacher.qualification}</p>
          <p><strong>Experience:</strong> {selectedTeacher.experience}</p>
          <p>
            <strong>Subjects:</strong>{" "}
            {selectedTeacher.subjects?.join(", ") || "N/A"}
          </p>

          <div className="button-group">
            <button
              disabled={loading}
              onClick={() => handleTeacherApproval("Approved")}
              className="approve-btn"
            >
              {loading ? "Processing..." : "Approve"}
            </button>
          </div>

          <div className="reject-section">
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="3"
            />
            <button
              disabled={loading}
              onClick={() => handleTeacherApproval("Rejected")}
              className="reject-btn"
            >
              {loading ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;