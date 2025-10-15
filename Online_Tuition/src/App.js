import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Subjects from './pages/Subjects';
import StudentRegister from './pages/StudentRegister';
import TeacherRegister from './pages/TeacherRegister';
// import Classroom from './pages/Classroom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TeacherDetails from './pages/TeacherDetails';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Assignments from './pages/Assignments';
import TeacherAssignments from './pages/TeacherAssignments';
import ExtraClasses from './pages/ExploreMore';
import TakeAttendance from './pages/TakeAttendance';
import StudentQueries from './pages/StudentQueries';
import RaiseQuery from './pages/RaiseQuery';
import ManageStudents from './pages/ManageStudents';
import ManageTeachers from './pages/ManageTeachers';
import ManagePayments from './pages/ManagePayments';
import ManageSubjects from './pages/ManageSubjects';
import FeePayment from './pages/FeePayment';
import PaymentHistory from './pages/PaymentHistory';
import Payments from './pages/Payments';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

import { LiveClassProvider } from './contexts/LiveClassContext';
import LiveClass from './pages/LiveClass';
import TeacherSubjects from './pages/TeacherSubjects';
import JitsiRedirectHandler from './components/JitsiRedirectHandler';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './styles/layout.css';

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const isLoggedIn = !!userRole;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && isLoggedIn) {
        setSidebarOpen(true);
      } else if (mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoggedIn]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const getMainContentClass = () => {
    if (!isLoggedIn) return 'main-content';
    if (isMobile) return 'main-content';
    return `main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`;
  };

  return (
    <>
      {/* Add JitsiRedirectHandler here - it will handle leave notifications globally */}
      <JitsiRedirectHandler />
      
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      {isLoggedIn && (
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />
      )}
      <main className={getMainContentClass()}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/teacher-subjects" element={<TeacherSubjects />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/teacher" element={<TeacherRegister />} />
          <Route path="/subject-details" element={<TeacherDetails />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/teacher-assignments" element={<TeacherAssignments />} />
          <Route path="/explore-more" element={<ExtraClasses />} />
          <Route path="/take-attendance" element={<TakeAttendance />} />
          <Route path="/student-queries" element={<StudentQueries />} />
          <Route path="/queries" element={<RaiseQuery />} />
          <Route path="/manage-students" element={<ManageStudents />} />
          <Route path="/manage-teachers" element={<ManageTeachers />} />
          <Route path="/manage-payments" element={<ManagePayments />} />
          <Route path="/manage-subjects" element={<ManageSubjects />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/fee-payment" element={<FeePayment />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/live-class" element={<LiveClass />} />
          {/* <Route path="/classroom" element={<Classroom />} /> */}
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <LiveClassProvider>
          <AppContent />
        </LiveClassProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
