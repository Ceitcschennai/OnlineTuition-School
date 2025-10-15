
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/teacherDashboard.css';
import { 
  FaTasks, 
  FaUserCheck, 
  FaQuestionCircle,
  FaChartLine,
  FaClock,
  FaClipboardList,
  FaGraduationCap,
  FaBook
} from 'react-icons/fa';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    assignmentsToReview: 0,
    pendingQueries: 0,
    upcomingClasses: 0,
    attendanceRate: 0,
    activeClasses: 0,
    assignedSubjects: 0
  });
  
  const [teacherInfo, setTeacherInfo] = useState({
    name: '',
    classes: [],
    subjects: []
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageAssignmentScore: 0,
    classParticipation: 0,
    assignmentSubmissionRate: 0
  });
  const [classDetails, setClassDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getTeacherId = () => {
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      const teacher = JSON.parse(teacherData);
      return teacher.id;
    }
    return null;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();
      
      if (!teacherId) {
        throw new Error('Teacher ID not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/teacher/dashboard/stats/${teacherId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      setStats(data.stats);
      setTeacherInfo(data.teacherInfo);
      setRecentActivities(data.recentActivities);
      setPerformanceMetrics(data.performanceMetrics);
      setClassDetails(data.classDetails);
      setError('');
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <div className="teacher-loading-container">
          <div className="teacher-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-dashboard">
        <div className="teacher-error-container">
          <p className="teacher-error-message">{error}</p>
          <button onClick={fetchDashboardData} className="teacher-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      {/* Header Section */}
      <div className="teacher-dashboard-header">
        <div className="teacher-welcome-section">
          <div className="teacher-welcome-text">
            <h1>Welcome back, {teacherInfo.name}!</h1>
            <p>Manage your classes and help students succeed</p>
            {teacherInfo.classes.length > 0 && (
              <div className="teacher-assignment-info">
                <span className="teacher-assignment-detail">
                  <FaGraduationCap /> Classes: {teacherInfo.classes.join(', ')}
                </span>
                <span className="teacher-assignment-detail">
                  <FaBook /> Subjects: {teacherInfo.subjects.join(', ')}
                </span>
              </div>
            )}
          </div>
          <div className="teacher-header-stats">
            <div className="teacher-stat-item">
              <span className="teacher-stat-number">{stats.totalStudents}</span>
              <span className="teacher-stat-label">Students</span>
            </div>
            <div className="teacher-stat-item">
              <span className="teacher-stat-number">{stats.attendanceRate}%</span>
              <span className="teacher-stat-label">Attendance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="teacher-stats-grid">
        <div className="teacher-stat-card teacher-primary">
          <div className="teacher-stat-content">
            <div className="teacher-stat-info">
              <h4>{stats.assignmentsToReview}</h4>
              <p>Assignments to Review</p>
            </div>
          </div>
          <div className="teacher-stat-footer">
            <span className="teacher-stat-change teacher-negative">
              {stats.assignmentsToReview > 0 ? 'Pending review' : 'All caught up!'}
            </span>
          </div>
        </div>

        <div className="teacher-stat-card teacher-warning">
          <div className="teacher-stat-content">
            <div className="teacher-stat-info">
              <h4>{stats.pendingQueries}</h4>
              <p>Student Queries</p>
            </div>
          </div>
          <div className="teacher-stat-footer">
            <span className="teacher-stat-change">
              {stats.pendingQueries > 0 ? 'Awaiting response' : 'No pending queries'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="teacher-dashboard-content-grid">
        {/* Recent Activities */}
        <div className="teacher-dashboard-section">
          <h3 className="teacher-section-title">
            <FaClock className="teacher-section-icon" />
            Recent Activities
          </h3>
          <div className="teacher-activities-list">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="teacher-activity-item">
                  <div className={`teacher-activity-icon teacher-${activity.type}`}>
                    {activity.type === 'assignment' && <FaTasks />}
                    {activity.type === 'attendance' && <FaUserCheck />}
                    {activity.type === 'student' && <FaQuestionCircle />}
                    {activity.type === 'class' && <FaClipboardList />}
                  </div>
                  <div className="teacher-activity-content">
                    <p className="teacher-activity-text">{activity.activity}</p>
                    <span className="teacher-activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="teacher-no-activities">
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="teacher-dashboard-section">
          <h3 className="teacher-section-title">
            <FaChartLine className="teacher-section-icon" />
            Class Performance
          </h3>
          <div className="teacher-performance-grid">
            <div className="teacher-performance-item">
              <h4>Average Assignment Score</h4>
              <div className="teacher-performance-value">{performanceMetrics.averageAssignmentScore}%</div>
              <div className="teacher-performance-bar">
                <div 
                  className="teacher-performance-fill" 
                  style={{ width: `${performanceMetrics.averageAssignmentScore}%` }}
                ></div>
              </div>
            </div>
            
            <div className="teacher-performance-item">
              <h4>Class Participation</h4>
              <div className="teacher-performance-value">{performanceMetrics.classParticipation}%</div>
              <div className="teacher-performance-bar">
                <div 
                  className="teacher-performance-fill" 
                  style={{ width: `${performanceMetrics.classParticipation}%` }}
                ></div>
              </div>
            </div>

            <div className="teacher-performance-item">
              <h4>Assignment Submission Rate</h4>
              <div className="teacher-performance-value">{performanceMetrics.assignmentSubmissionRate}%</div>
              <div className="teacher-performance-bar">
                <div 
                  className="teacher-performance-fill" 
                  style={{ width: `${performanceMetrics.assignmentSubmissionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
