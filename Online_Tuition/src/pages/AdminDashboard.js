import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/adminDashboard.css';
import { 
  FaChalkboardTeacher, 
  FaCreditCard,
  FaChartLine,
  FaClock,
  FaUserGraduate,
  FaExclamationTriangle,
  FaCog
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    activeClasses: 0,
    attendanceRate: 0,
    systemAlerts: 0,
    pendingStudents: 0,
    pendingTeachers: 0,
    approvedStudents: 0,
    approvedTeachers: 0,
    assignedTeachers: 0,
    paidStudents: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      setStats(data.stats);
      setRecentActivities(data.recentActivities);
      setSystemAlerts(data.systemAlerts);
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
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error-container">
          <p className="admin-error-message">{error}</p>
          <button onClick={fetchDashboardData} className="admin-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="admin-dashboard-header">
        <div className="admin-welcome-section">
          <div className="admin-welcome-text">
            <h1>Welcome back, Admin!</h1>
            <p>Here's what's happening in your tuition center today</p>
          </div>
          <div className="admin-header-stats">
            <div className="admin-stat-item">
              <div>
                <span className="admin-stat-number">{stats.totalStudents}</span>
                <span className="admin-stat-label">Students Enrolled</span>
              </div>
            </div>
            <div className="admin-stat-item">
              <div>
                <span className="admin-stat-number">{stats.activeClasses}</span>
                <span className="admin-stat-label">Classes Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="admin-alerts-section">
          <h3 className="admin-section-title">
            <FaExclamationTriangle className="admin-section-icon" />
            System Alerts
          </h3>
          <div className="admin-alerts-container">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`admin-alert admin-alert-${alert.type}`}>
                <div className="admin-alert-content">
                  <p>{alert.message}</p>
                  <span className="admin-alert-time">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card admin-primary">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="admin-stat-footer">
            <span className="admin-stat-change admin-positive">
              {stats.approvedStudents} approved, {stats.pendingStudents} pending
            </span>
          </div>
        </div>

        <div className="admin-stat-card admin-success">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>{stats.totalTeachers}</h3>
              <p>Active Teachers</p>
            </div>
          </div>
          <div className="admin-stat-footer">
            <span className="admin-stat-change admin-positive">
              {stats.assignedTeachers} assigned, {stats.pendingTeachers} pending
            </span>
          </div>
        </div>

        <div className="admin-stat-card admin-warning">
          <div className="admin-stat-content">
            <div className="admin-stat-info">
              <h3>₹{stats.monthlyRevenue.toLocaleString()}</h3>
              <p>Monthly Revenue</p>
            </div>
          </div>
          <div className="admin-stat-footer">
            <span className="admin-stat-change admin-positive">
              {stats.paidStudents} paid, {stats.pendingPayments} pending
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="admin-dashboard-content-grid">
        {/* Recent Activities */}
        <div className="admin-dashboard-section">
          <h3 className="admin-section-title">
            <FaClock className="admin-section-icon" />
            Recent Activities
          </h3>
          <div className="admin-activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="admin-activity-item">
                <div className={`admin-activity-icon admin-${activity.type}`}>
                  {activity.type === 'student' && <FaUserGraduate />}
                  {activity.type === 'payment' && <FaCreditCard />}
                  {activity.type === 'teacher' && <FaChalkboardTeacher />}
                  {activity.type === 'system' && <FaCog />}
                </div>
                <div className="admin-activity-content">
                  <p className="admin-activity-text">{activity.activity}</p>
                  <span className="admin-activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="admin-dashboard-section">
          <h3 className="admin-section-title">
            <FaChartLine className="admin-section-icon" />
            System Overview
          </h3>
          <div className="admin-system-overview">
            <div className="admin-overview-item">
              <div className="admin-overview-header">
                <span>Student Approval Rate</span>
                <span className="admin-overview-value">{stats.attendanceRate}%</span>
              </div>
              <div className="admin-overview-bar">
                <div 
                  className="admin-overview-fill" 
                  style={{ width: `${stats.attendanceRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="admin-overview-item">
              <div className="admin-overview-header">
                <span>Payment Collection Rate</span>
                <span className="admin-overview-value">
                  {stats.totalStudents > 0 ? Math.round((stats.paidStudents / stats.totalStudents) * 100) : 0}%
                </span>
              </div>
              <div className="admin-overview-bar">
                <div 
                  className="admin-overview-fill" 
                  style={{ 
                    width: `${stats.totalStudents > 0 ? Math.round((stats.paidStudents / stats.totalStudents) * 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="admin-overview-item">
              <div className="admin-overview-header">
                <span>Teacher-Student Ratio</span>
                <span className="admin-overview-value">
                  1:{stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}
                </span>
              </div>
              <div className="admin-overview-description">
                {stats.totalTeachers > 0 && stats.totalStudents / stats.totalTeachers <= 15 
                  ? 'Optimal ratio maintained' 
                  : 'Consider adding more teachers'}
              </div>
            </div>

            <div className="admin-overview-item">
              <div className="admin-overview-header">
                <span>Platform Activity</span>
                <span className="admin-overview-value">
                  {stats.systemAlerts === 0 ? 'All Clear' : `${stats.systemAlerts} Alert${stats.systemAlerts > 1 ? 's' : ''}`}
                </span>
              </div>
              <div className="admin-overview-description">
                {stats.systemAlerts === 0 ? 'System running smoothly' : 'Requires attention'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
