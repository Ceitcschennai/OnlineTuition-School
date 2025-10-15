import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaChartBar,
  FaSearch,
  FaBookOpen,
  FaTasks,
  FaQuestionCircle,
  FaCreditCard,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserCheck,
  FaChevronRight,
  FaTimes,
  FaVideo
} from 'react-icons/fa';
import '../styles/sidebar.css';

// Menu configuration for different user roles
const menuConfig = {
  common: [
    // "Explore" removed from here
  ],
  student: [
    // { to: '/classroom', icon: FaVideo, label: 'Classroom' },
    { to: '/subjects', icon: FaBookOpen, label: 'Subjects' },
    { to: '/assignments', icon: FaTasks, label: 'Tasks' },
    { to: '/queries', icon: FaQuestionCircle, label: 'Queries' },
    // { to: '/explore-more', icon: FaSearch, label: 'Explore' }, 
    { to: '/payments', icon: FaCreditCard, label: 'Payments' },
    
  ],
  
  teacher: [
    { to: '/teacher-subjects', icon: FaBookOpen, label: 'Subjects' },
    { to: '/teacher-assignments', icon: FaTasks, label: 'Assignment' },
    { to: '/take-attendance', icon: FaUserCheck, label: 'Attendance' },
    // { to: '/teacher-schedule', icon: FaChartBar, label: 'Schedule' }, 
    { to: '/student-queries', icon: FaQuestionCircle, label: 'Queries' }
  ],

  admin: [
    { to: '/manage-subjects', icon: FaBookOpen, label: 'Subjects' },
    { to: '/manage-students', icon: FaUserGraduate, label: 'Students' },
    { to: '/manage-teachers', icon: FaChalkboardTeacher, label: 'Teachers' },
    { to: '/manage-payments', icon: FaCreditCard, label: 'Payments' }
  ]
};


const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const userRole = localStorage.getItem('userRole');

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const getDashboardLink = () => {
    const dashboards = {
      admin: '/admin-dashboard',
      teacher: '/teacher-dashboard',
      student: '/student-dashboard'
    };
    return dashboards[userRole] || '/login';
  };

  const getMenuItems = () => {
    const dashboardItem = {
      to: getDashboardLink(),
      icon: FaChartBar,
      label: 'Dashboard'
    };

    const commonItems = menuConfig.common;
    const roleItems = menuConfig[userRole] || [];

    return [dashboardItem, ...commonItems, ...roleItems];
  };

  const isLoggedIn = !!userRole;

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile' : 'desktop'}`}>
        {/* Header */}
        <div className="sidebar-header">
          {!isMobile && (
            <button
              className="sidebar-toggle-desktop"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Collapse" : "Expand"}
            >
              {isOpen ? <FaTimes /> : <FaChevronRight />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {getMenuItems().map((item, index) => (
            <div key={index} className="nav-item">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={handleLinkClick}
                title={item.label}
              >
                <item.icon className="nav-icon" />
                {(isOpen || isMobile) && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
