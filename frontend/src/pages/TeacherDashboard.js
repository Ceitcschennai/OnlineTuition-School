import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import "../styles/teacherDashboard.css";
import {
  FaChartLine,
  FaClock,
  FaGraduationCap,
  FaBook,
  FaUsers,
  FaTasks,
  FaQuestionCircle,
  FaPlus,
  FaCalendarCheck,
  FaChartBar
} from "react-icons/fa";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    assignmentsToReview: 0,
    pendingQueries: 0,
    attendanceRate: 0
  });

  const [teacherInfo, setTeacherInfo] = useState({
    name: "",
    classes: [],
    subjects: []
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const teacherId = localStorage.getItem("teacherId");
  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!teacherId || !token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/teacher/dashboard/stats/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const data = await res.json();

      setStats(data.stats);
      setTeacherInfo(data.teacherInfo);
      setRecentActivities(data.recentActivities || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  const today = new Date().toLocaleDateString();

  return (
    <div className="teacher-dashboard">

      {/* 🔵 Gradient Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {teacherInfo.name}</h1>
          <p>Here’s what’s happening in your classes today</p>
          <span className="dashboard-date">{today}</span>
          <p>
            <FaGraduationCap /> Classes:{" "}
            {teacherInfo.classes.join(", ") || "—"}
          </p>
          <p>
            <FaBook /> Subjects:{" "}
            {teacherInfo.subjects.join(", ") || "—"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button onClick={() => navigate("/teacher-assignments")}>
            <FaPlus /> Add Assignment
          </button>
          <button onClick={() => navigate("/take-attendance")}>
            <FaCalendarCheck /> Mark Attendance
          </button>
          <button onClick={() => navigate("/reports")}>
            <FaChartBar /> View Reports
          </button>
        </div>
      </div>

      {/* 🟡 Alerts */}
      <div className="alert-section">
        {stats.assignmentsToReview > 0 && (
          <p>⚠ {stats.assignmentsToReview} Assignments to review</p>
        )}
        {stats.pendingQueries > 0 && (
          <p>⚠ {stats.pendingQueries} Student doubts pending</p>
        )}
      </div>

      {/* 🟢 Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaUsers />
          <h3>{stats.totalStudents}</h3>
          <p>Total Students</p>
        </div>

        <div className="stat-card">
          <FaTasks />
          <h3>{stats.assignmentsToReview}</h3>
          <p>Assignments to Review</p>
        </div>

        <div className="stat-card">
          <FaChartLine />
          <h3>{stats.attendanceRate}%</h3>
          <p>Average Attendance</p>
        </div>

        <div className="stat-card">
          <FaQuestionCircle />
          <h3>{stats.pendingQueries}</h3>
          <p>Pending Queries</p>
        </div>
      </div>

      {/* 🟣 Progress + Activity */}
      <div className="dashboard-main">

        {/* Progress Overview */}
        <div className="progress-section">
          <h2>Progress Overview</h2>

          <div className="progress-item">
            <p>Overall Class Attendance</p>
            <div className="progress-bar">
              <div style={{ width: `${stats.attendanceRate}%` }}></div>
            </div>
          </div>

          <div className="progress-item">
            <p>Assignment Evaluation Progress</p>
            <div className="progress-bar">
              <div
                style={{
                  width:
                    stats.assignmentsToReview > 0
                      ? `${100 - stats.assignmentsToReview * 10}%`
                      : "100%"
                }}
              ></div>
            </div>
          </div>

          <div className="progress-item">
            <p>Course Completion Progress</p>
            <div className="progress-bar">
              <div style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>

        {/* 🔵 Recent Activity */}
        <div className="recent-section">
          <h2>
            <FaClock /> Recent Activities
          </h2>

          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <p>{activity.message}</p>
                <span>
                  {new Date(activity.time).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p>No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
