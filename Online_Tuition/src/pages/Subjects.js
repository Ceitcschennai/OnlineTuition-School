import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/subjects.css'; 
import { useNavigate } from 'react-router-dom';
import { FaBook, FaLaptopCode, FaCalculator, FaPlay, FaCircle, FaUsers, FaClock, FaArrowRight, FaVideo } from 'react-icons/fa';
import { useLiveClass } from '../contexts/LiveClassContext';
import { joinJitsiMeeting } from '../utils/jitsiUtils';

// Image Imports
import English from '../assets/English.jpeg';
import Tamil from '../assets/Tamil.jpeg';
import Maths from '../assets/Maths.jpeg';
import Science from '../assets/Science.jpeg';
import Social from '../assets/Social.jpeg';
import Chemistry from '../assets/Chemistry.jpeg';
import Physics from '../assets/Physics.jpeg';
import Zoology from '../assets/Zoology.jpeg';
import Botany from '../assets/Botany.jpeg';
import Economics from '../assets/Economics.jpeg';
import History from '../assets/History.jpeg';
import Geography from '../assets/Geography.jpeg';
import Hindi from '../assets/Hindi.jpeg';
import ComputerScience from '../assets/ComputerScience.jpeg';
import Accounts from '../assets/Accounts.jpeg';

const subjects = [
  { name: 'English', image: English, icon: <FaBook /> },
  { name: 'Tamil', image: Tamil, icon: <FaBook /> },
  { name: 'Maths', image: Maths, icon: <FaCalculator /> },
  { name: 'Science', image: Science, icon: <FaBook /> },
  { name: 'Social', image: Social, icon: <FaBook /> },
  { name: 'Chemistry', image: Chemistry, icon: <FaBook /> },
  { name: 'Physics', image: Physics, icon: <FaBook /> },
  { name: 'Zoology', image: Zoology, icon: <FaBook /> },
  { name: 'Botany', image: Botany, icon: <FaBook /> },
  { name: 'Geography', image: Geography, icon: <FaBook /> },
  { name: 'History', image: History, icon: <FaBook /> },
  { name: 'Economics', image: Economics, icon: <FaBook /> },
  { name: 'Hindi', image: Hindi, icon: <FaBook /> },
  { name: 'Computer Science', image: ComputerScience, icon: <FaLaptopCode /> },
  { name: 'Accounts', image: Accounts, icon: <FaBook /> },
];

const Subjects = () => {
  const navigate = useNavigate();
  const { liveClasses, joinClass } = useLiveClass();
  const [joiningClass, setJoiningClass] = useState(false);
  
  const student = JSON.parse(localStorage.getItem('student') || '{}');

  // Get student data
  const getStudentData = () => {
    try {
      const studentData = localStorage.getItem('student');
      if (studentData) {
        return JSON.parse(studentData);
      }
      return null;
    } catch (error) {
      console.error('Error getting student data:', error);
      return null;
    }
  };

  const getLiveClassForSubject = (subjectName) => {
    return liveClasses.find(liveClass => 
      liveClass.subject === subjectName && 
      liveClass.class === student.class &&
      liveClass.isLive
    );
  };

  // Notify backend when student joins
  const notifyJoinClass = async (liveClass, studentData) => {
    try {
      console.log('Notifying backend of student join:', {
        classId: liveClass.id,
        studentId: studentData._id || studentData.id,
        studentName: `${studentData.firstName} ${studentData.lastName}`.trim(),
        studentEmail: studentData.email
      });

      const response = await axios.post(`${API_BASE_URL}/api/live-classes/join`, {
        classId: liveClass.id,
        studentId: studentData._id || studentData.id,
        studentName: `${studentData.firstName} ${studentData.lastName}`.trim(),
        studentEmail: studentData.email
      });

      if (response.data.success) {
        console.log('✅ Backend notified successfully:', response.data);
        
        // Store the classId and studentId in localStorage
        localStorage.setItem('currentLiveClassId', liveClass.id);
        localStorage.setItem('currentStudentId', studentData._id || studentData.id);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error notifying backend of join:', error);
      return false;
    }
  };

  // Notify backend when student leaves
  const notifyLeaveClass = async (classId, studentId) => {
    try {
      console.log('Notifying backend of student leave:', { classId, studentId });

      const response = await axios.post(`${API_BASE_URL}/api/live-classes/leave`, {
        classId,
        studentId
      });

      if (response.data.success) {
        console.log('✅ Leave notification sent successfully');
        
        // Clean up localStorage
        localStorage.removeItem('currentLiveClassId');
        localStorage.removeItem('currentStudentId');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error notifying backend of leave:', error);
      return false;
    }
  };

  // Handle joining live class
  const handleJoinLiveClass = async (subject) => {
    const liveClass = getLiveClassForSubject(subject.name);
    const studentData = getStudentData();
    
    if (!liveClass || !liveClass.roomName) {
      alert('Unable to join class. Meeting room not available.');
      return;
    }

    if (!studentData) {
      alert('Student information not found. Please login again.');
      return;
    }

    // Show confirmation
    const confirmJoin = window.confirm(
      `Join live class for ${subject.name}?\nTeacher: ${liveClass.teacher}\n\nThis will open the meeting in a new window.`
    );
    
    if (!confirmJoin) return;

    setJoiningClass(true);

    try {
      // 1. Notify backend that student is joining
      const joinSuccess = await notifyJoinClass(liveClass, studentData);
      
      if (!joinSuccess) {
        alert('Failed to join class. Please try again.');
        setJoiningClass(false);
        return;
      }

      // 2. Update context
      joinClass(liveClass);

      // 3. Open Jitsi in NEW WINDOW (with classId)
      const displayName = `${studentData.firstName} ${studentData.lastName} (Student)`;
      const success = joinJitsiMeeting(liveClass.roomName, displayName, liveClass.id);
      
      if (!success) {
        alert('Failed to open meeting window. Please enable popups.');
      } else {
        console.log('✅ Jitsi meeting window opened successfully');
      }
      
    } catch (error) {
      console.error('Error joining class:', error);
      alert('An error occurred while joining the class.');
    } finally {
      setJoiningClass(false);
    }
  };

  // Listen for Jitsi window close event
  useEffect(() => {
    const handleJitsiWindowClosed = async (event) => {
      const classId = localStorage.getItem('currentLiveClassId');
      const studentId = localStorage.getItem('currentStudentId');
      
      if (classId && studentId) {
        await notifyLeaveClass(classId, studentId);
      }
    };

    window.addEventListener('jitsiWindowClosed', handleJitsiWindowClosed);

    return () => {
      window.removeEventListener('jitsiWindowClosed', handleJitsiWindowClosed);
    };
  }, []);

  const handleViewDetails = (subject) => {
    navigate('/subject-details', {
      state: {
        subjectName: subject.name,
        teachers: [],
      },
    });
  };

  // Get live classes for student's class
  const getStudentLiveClasses = () => {
    if (!student || !student.class) return [];
    
    return liveClasses.filter(liveClass => 
      liveClass.class === student.class && liveClass.isLive
    );
  };

  // Get formatted time
  const getFormattedTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get duration since start
  const getDurationSinceStart = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just started';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m ago`;
  };

  const studentLiveClasses = getStudentLiveClasses();

  return (
    <div className="student-subjects-wrapper">
      <div className="student-subjects-header">
        <h2 className="student-subjects-title">My Subjects</h2>
        <p className="student-subjects-description">Join live classes or explore subject materials</p>
      </div>

      <div className="student-subjects-info-card">
        <div className="student-subjects-info">
          <p className="student-subjects-count">{student?.class || 'N/A'} • {subjects.length} Subjects Available</p>
        </div>
        
        {studentLiveClasses.length > 0 && (
          <div className="student-subjects-live-banner">
            <h3 className="student-subjects-live-title">🔴 Live Classes Available - 
              <span className="student-subjects-live-count">
                {studentLiveClasses.length} class(es) are currently live!
              </span>
            </h3>
          </div>
        )}
      </div>

      <div className="student-subjects-list">
        {subjects.map((subject, idx) => {
          const liveClass = getLiveClassForSubject(subject.name);
          const isLive = !!liveClass;
          
          return (
            <div className={`student-subjects-card-horizontal ${isLive ? 'student-subjects-live-card-horizontal' : ''}`} key={idx}>
              {/* Left Side - Image */}
              <div className="student-subjects-image-section">
                <div className="student-subjects-image-container-horizontal">
                  <img src={subject.image} alt={subject.name} className="student-subjects-image-horizontal" />
                  
                  {/* Live Indicator */}
                  {isLive && (
                    <div className="student-subjects-live-indicator-horizontal">
                      <FaCircle className="student-subjects-live-dot" />
                      <span className="student-subjects-live-text">LIVE</span>
                    </div>
                  )}
                  
                  {/* Subject Icon Overlay */}
                  <div className="student-subjects-icon-overlay">
                    <div className="student-subjects-icon-horizontal">{subject.icon}</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="student-subjects-content-section">
                <div className="student-subjects-content-header">
                  <div className="student-subjects-title-section">
                    <h3 className="student-subjects-name-horizontal">{subject.name}</h3>
                    {isLive && (
                      <div className="student-subjects-live-badge">
                        <FaCircle className="live-pulse-dot" />
                        <span>Live Now</span>
                      </div>
                    )}
                  </div>
                  
                  {!isLive && (
                    <div className="student-subjects-status-normal">
                      <span className="status-text">Available for Study</span>
                    </div>
                  )}
                </div>

                {/* Live Class Details */}
                {isLive && liveClass && (
                  <div className="student-subjects-live-info-horizontal">
                    <div className="student-subjects-live-meta">
                      <div className="live-meta-item">
                        <FaUsers className="live-meta-icon" />
                        <span><strong>Teacher:</strong> {liveClass.teacher}</span>
                      </div>
                      <div className="live-meta-item">
                        <FaClock className="live-meta-icon" />
                        <span><strong>Started:</strong> {getFormattedTime(liveClass.startTime)}</span>
                      </div>
                      <div className="live-meta-item">
                        <FaCircle className="live-meta-icon live-duration" />
                        <span><strong>Duration:</strong> {getDurationSinceStart(liveClass.startTime)}</span>
                      </div>
                      {liveClass.participants && liveClass.participants.length > 0 && (
                        <div className="live-meta-item">
                          <FaUsers className="live-meta-icon" />
                          <span><strong>Students Joined:</strong> {liveClass.participants.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Normal Subject Info for non-live classes */}
                {!isLive && (
                  <div className="student-subjects-normal-info">
                    <p className="subject-description">
                      Explore comprehensive study materials, practice exercises, and recorded lessons for {subject.name}.
                    </p>
                    <div className="subject-features">
                      <span className="feature-tag">Study Materials</span>
                      <span className="feature-tag">Practice Tests</span>
                      <span className="feature-tag">Video Lessons</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="student-subjects-actions-horizontal">
                  {isLive ? (
                    <button
                      className="student-subjects-join-btn-horizontal"
                      onClick={() => handleJoinLiveClass(subject)}
                      disabled={joiningClass}
                    >
                      <FaVideo className="btn-icon" />
                      <span>{joiningClass ? 'Joining...' : 'Join Live Class'}</span>
                      <FaArrowRight className="btn-arrow" />
                    </button>
                  ) : (
                    <button
                      className="student-subjects-details-btn-horizontal"
                      onClick={() => handleViewDetails(subject)}
                    >
                      <FaBook className="btn-icon" />
                      <span>View Details</span>
                      <FaArrowRight className="btn-arrow" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subjects;
