import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/studentDashboard.css';
import {
  FaTasks,
  FaCreditCard,
  FaChartLine
} from 'react-icons/fa';

const StudentDashboard = ({ student: propStudent }) => {
  const [student, setStudent] = useState(propStudent || null);
  const [stats, setStats] = useState({
    enrolledSubjects: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    lastPayment: 'Pending',
    attendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [enrolledSubjectsList, setEnrolledSubjectsList] = useState([]);

  // Get student data from localStorage
  const getStudentData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.student || parsedData;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!student) {
      const loadedStudent = getStudentData();
      if (loadedStudent) setStudent(loadedStudent);
    }
  }, [student]);

  useEffect(() => {
    if (student && student.id) {
      fetchDashboardData();
    }
  }, [student]);

  const fetchDashboardData = async () => {
    try {
      if (!student || !student.id) {
        console.error('Student ID is missing!');
        setLoading(false);
        return;
      }

      const studentClass = (student?.class || localStorage.getItem('studentClass') || localStorage.getItem('userClass') || '10')
        .toString()
        .replace(/^Class\s*/i, '');

      // Fetch assignments
      const assignmentsResponse = await fetch(`${API_BASE_URL}/api/assignments/student/${student.id}?class=${studentClass}`);
      const assignmentsData = await assignmentsResponse.json();

      let pendingCount = 0;
      let completedCount = 0;

      if (assignmentsData.success && assignmentsData.assignments) {
        pendingCount = assignmentsData.assignments.filter(a => !a.hasSubmitted).length;
        completedCount = assignmentsData.assignments.filter(a => a.hasSubmitted).length;
      }

      // Fetch other dashboard stats
      const dashboardResponse = await fetch(`${API_BASE_URL}/api/student/${student.id}/dashboard`);
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        if (dashboardData.success) {
          setStats({
            enrolledSubjects: dashboardData.stats?.enrolledSubjects || 0,
            pendingAssignments: pendingCount,
            completedAssignments: completedCount,
            lastPayment: dashboardData.stats?.lastPayment || 'Pending',
            attendance: dashboardData.stats?.attendance || 0
          });
          setEnrolledSubjectsList(dashboardData.enrolledSubjectsList || []);
        } else {
          setStats(prev => ({
            ...prev,
            pendingAssignments: pendingCount,
            completedAssignments: completedCount
          }));
        }
      } else {
        setStats(prev => ({
          ...prev,
          pendingAssignments: pendingCount,
          completedAssignments: completedCount
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return (
      <div className="student-portal">
        <div className="student-portal-header">
          <div className="student-welcome-section">
            <div className="student-welcome-text">
              <h1>Welcome to Student Dashboard!</h1>
              <p>Please log in to view your student information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="student-portal">
        <div className="student-portal-header">
          <div className="student-welcome-section">
            <div className="student-welcome-text">
              <h1>Loading Dashboard...</h1>
              <p>Please wait while we fetch your data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-portal">
      {/* Header Section */}
      <div className="student-portal-header">
        <div className="student-welcome-section">
          <div className="student-welcome-text">
            <h1>Welcome back, {student?.firstName ? `${student.firstName}${student.lastName ? ` ${student.lastName}` : ''}` : 'Student'}!</h1>
            <p>Here's what's happening with your studies today</p>
          </div>
        </div>
      </div>

      <div className="student-header-info">
        {/* Status Banners */}
        {student && student.approvalStatus !== 'Approved' && (
          <div className="student-reminder-banner">
            ⏳ Your registration is pending admin approval.
          </div>
        )}

        {student && student.status !== 'Paid' && student.approvalStatus === 'Approved' && (
          <div className="student-reminder-banner">
            ⚠️ You haven't completed the payment yet. Please contact admin.
          </div>
        )}

        {student && student.status === 'Paid' && (
          <div className="student-reminder-banner student-success">
            ✅ Your account is active and payment is up to date!
          </div>
        )}
      </div>

      {/* Horizontal Cards Row */}
      <div className="student-cards-row">
        {/* Vertical Cards */}
        <div className="student-vertical-cards">
          <div className="student-stat-card student-primary-vertical">
            <div className="student-stat-content">
              <FaTasks className="student-stat-icon" />
              <h4>{stats.pendingAssignments}</h4>
              <h4>Pending Assignments</h4>
            </div>
          </div>

          <div className="student-stat-card student-info-vertical">
            <div className="student-stat-content">
              <FaCreditCard className="student-stat-icon" />
              <h4>{stats.lastPayment}</h4>
              <h4>Payment Status</h4>
            </div>
          </div>
        </div>

        {/* Progress Overview Card */}
        <div className="student-progress-overview-card">
          <h3 className="student-section-title">
            <FaChartLine className="student-section-icon" />
            Progress Overview
          </h3>
          <div className="student-progress-container">
            <div className="student-progress-item">
              <div className="student-progress-header">
                <span>Overall Attendance</span>
                <span className="student-progress-value">{stats.attendance}%</span>
              </div>
              <div className="student-progress-bar">
                <div
                  className="student-progress-fill"
                  style={{ width: `${stats.attendance}%` }}
                ></div>
              </div>
            </div>

            <div className="student-progress-item">
              <div className="student-progress-header">
                <span>Assignment Completion</span>
                <span className="student-progress-value">
                  {stats.completedAssignments + stats.pendingAssignments > 0
                    ? Math.round((stats.completedAssignments / (stats.completedAssignments + stats.pendingAssignments)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="student-progress-bar">
                <div
                  className="student-progress-fill"
                  style={{
                    width: `${stats.completedAssignments + stats.pendingAssignments > 0
                      ? Math.round((stats.completedAssignments / (stats.completedAssignments + stats.pendingAssignments)) * 100)
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="student-progress-item">
              <div className="student-progress-header">
                <span>Course Progress</span>
                <span className="student-progress-value">
                  {enrolledSubjectsList.length > 0 ? Math.round((stats.enrolledSubjects / enrolledSubjectsList.length) * 100) : 0}%
                </span>
              </div>
              <div className="student-progress-bar">
                <div
                  className="student-progress-fill"
                  style={{
                    width: `${enrolledSubjectsList.length > 0 ? Math.round((stats.enrolledSubjects / enrolledSubjectsList.length) * 100) : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Enrolled Subjects List */}
          {enrolledSubjectsList.length > 0 && (
            <div className="student-subjects-section" style={{ marginTop: '20px' }}>
              <h4>Enrolled Subjects:</h4>
              <div className="student-subjects-list">
                {enrolledSubjectsList.map((subject, index) => (
                  <span key={index} className="student-subject-tag">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
