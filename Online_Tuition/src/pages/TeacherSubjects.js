import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { FaBook, FaLaptopCode, FaCalculator, FaPlay, FaStop, FaCircle, FaSpinner, FaExclamationTriangle, FaUserCheck, FaVideo, FaUsers } from 'react-icons/fa';
import { useLiveClass } from '../contexts/LiveClassContext';
import { generateRoomName, openJitsiInNewTab } from '../utils/jitsiUtils';
import '../styles/teacherSubjects.css';

// Image Imports (keep your existing imports)
import Maths from '../assets/Maths.jpeg';
import Physics from '../assets/Physics.jpeg';
import Chemistry from '../assets/Chemistry.jpeg';
import English from '../assets/English.jpeg';
import Tamil from '../assets/Tamil.jpeg';
import Science from '../assets/Science.jpeg';
import Social from '../assets/Social.jpeg';
import Zoology from '../assets/Zoology.jpeg';
import Botany from '../assets/Botany.jpeg';
import Geography from '../assets/Geography.jpeg';
import History from '../assets/History.jpeg';
import Economics from '../assets/Economics.jpeg';
import Hindi from '../assets/Hindi.jpeg';
import ComputerScience from '../assets/ComputerScience.jpeg';
import Accounts from '../assets/Accounts.jpeg';

const TeacherSubjects = () => {
  const navigate = useNavigate();
  const { liveClasses, startLiveClass, endLiveClass, joinClass } = useLiveClass();
  const [startingClass, setStartingClass] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  // Get teacher data from localStorage with better error handling
  const getTeacherData = () => {
    try {
      let teacherData = localStorage.getItem('teacher');

      if (teacherData) {
        console.log('Found teacher data in localStorage:', teacherData);
        return JSON.parse(teacherData);
      }

      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        console.log('Found user data in localStorage:', parsedUserData);

        if (parsedUserData.teacher) {
          console.log('Extracting teacher data from user data');
          localStorage.setItem('teacher', JSON.stringify(parsedUserData.teacher));
          return parsedUserData.teacher;
        }
      }

      console.log('No teacher data found in localStorage');
      return null;
    } catch (error) {
      console.error('Error parsing teacher data from localStorage:', error);
      return null;
    }
  };

  const teacher = getTeacherData();

  console.log('Teacher data:', teacher);

  // Image mapping
  const imageMap = {
    'Maths': Maths,
    'Physics': Physics,
    'Chemistry': Chemistry,
    'English': English,
    'Tamil': Tamil,
    'Science': Science,
    'Social': Social,
    'Zoology': Zoology,
    'Botany': Botany,
    'Geography': Geography,
    'History': History,
    'Economics': Economics,
    'Hindi': Hindi,
    'Computer Science': ComputerScience,
    'Accounts': Accounts
  };

  // Icon mapping
  const getSubjectIcon = (subjectName) => {
    switch (subjectName) {
      case 'Maths':
        return <FaCalculator />;
      case 'Computer Science':
        return <FaLaptopCode />;
      default:
        return <FaBook />;
    }
  };

  // Fetch teacher's assigned subjects
  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      if (!teacher || !teacher.id) {
        console.log('No teacher data or teacher ID found');
        setError('Please login again to continue.');
        setErrorCode('NO_TEACHER_DATA');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching subjects for teacher ID:', teacher.id);

        const response = await fetch(`${API_BASE_URL}/api/teacher/subjects/${teacher.id}`);
        const data = await response.json();

        console.log('API Response:', data);

        if (data.success) {
          const formattedSubjects = data.subjects.map(subject => ({
            ...subject,
            image: imageMap[subject.name] || imageMap['Science'],
            icon: getSubjectIcon(subject.name)
          }));
          setTeacherSubjects(formattedSubjects);
          setError(null);
          setErrorCode(null);
        } else {
          setError(data.message || 'Failed to fetch subjects');
          setErrorCode(data.code);
        }
      } catch (error) {
        console.error('Error fetching teacher subjects:', error);
        setError('Failed to connect to server. Please try again.');
        setErrorCode('NETWORK_ERROR');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherSubjects();
  }, [teacher]);

  const getTeacherLiveClasses = () => {
    return liveClasses.filter(liveClass => liveClass.teacherId === teacher?.id);
  };

  const isSubjectLive = (subjectName, className) => {
    return liveClasses.some(liveClass =>
      liveClass.subject === subjectName &&
      liveClass.class === className &&
      liveClass.teacherId === teacher?.id &&
      liveClass.isLive
    );
  };

  // Updated handleStartClass with Jitsi integration
  const handleStartClass = async (subject, className) => {
    setStartingClass(`${subject.name}-${className}`);

    try {
      // Generate unique room name for Jitsi
      const roomName = generateRoomName(subject.name, className, teacher.id);

      const classData = {
        subject: subject.name,
        teacher: teacher.name,
        teacherId: teacher.id,
        class: className,
        roomName: roomName, // Add room name to class data
        jitsiUrl: `https://meet.jit.si/${roomName}`
      };

      // Start live class in context/backend
      await startLiveClass(classData);

      // Open Jitsi in new tab as host
      const jitsiOpened = openJitsiInNewTab(
        roomName,
        `${teacher.name} (Teacher)`,
        subject.name,
        className
      );

      if (jitsiOpened) {
        console.log('Jitsi meeting started successfully');

        // Optional: Show success message
        setTimeout(() => {
          alert(`Live class started successfully for ${subject.name} - ${className}!\nJitsi meeting is now open in a new tab.`);
        }, 500);
      }

    } catch (error) {
      console.error('Error starting class:', error);
      alert('Failed to start class. Please try again.');
    } finally {
      setStartingClass(null);
    }
  };

  const handleEndClass = (subject, className) => {
    const liveClass = liveClasses.find(cls =>
      cls.subject === subject.name &&
      cls.class === className &&
      cls.teacherId === teacher?.id
    );

    if (liveClass) {
      // End the live class
      endLiveClass(liveClass.id);

      // Clean up meeting info from localStorage
      if (liveClass.roomName) {
        localStorage.removeItem(`meeting_${liveClass.roomName}`);
      }

      alert(`Live class ended for ${subject.name} - ${className}`);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    window.location.reload();
  };

  const handleLoginRedirect = () => {
    localStorage.removeItem('teacher');
    localStorage.removeItem('student');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');

    navigate('/login');
  };

  const teacherLiveClasses = teacher ? getTeacherLiveClasses() : [];

  if (loading) {
    return (
      <div className="teacher-subjects-wrapper">
        <div className="teacher-subjects-loading">
          <FaSpinner className="teacher-subjects-loading-spinner" />
          <p className="teacher-subjects-loading-text">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-subjects-wrapper">
        <div className="teacher-subjects-error">
          <FaExclamationTriangle className="teacher-subjects-error-icon" />
          <h3 className="teacher-subjects-error-title">Unable to Load Subjects</h3>
          <p className="teacher-subjects-error-message">{error}</p>

          <div className="teacher-subjects-error-actions">
            {errorCode === 'TEACHER_NOT_FOUND' || errorCode === 'NO_TEACHER_DATA' ? (
              <button onClick={handleLoginRedirect} className="teacher-subjects-btn-primary">
                Login Again
              </button>
            ) : errorCode === 'NOT_APPROVED' ? (
              <div className="teacher-subjects-approval-pending">
                <FaUserCheck className="teacher-subjects-pending-icon" />
                <p>Your account is pending admin approval.</p>
                <p>Please contact the administrator to get your account approved.</p>
                <button onClick={handleLoginRedirect} className="teacher-subjects-btn-secondary">
                  Back to Login
                </button>
              </div>
            ) : (
              <div className="teacher-subjects-error-buttons">
                <button onClick={handleRetry} className="teacher-subjects-btn-primary">
                  Try Again
                </button>
                <button onClick={handleLoginRedirect} className="teacher-subjects-btn-secondary">
                  Login Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (teacherSubjects.length === 0) {
    return (
      <div className="teacher-subjects-wrapper">
        <h2 className="teacher-subjects-title">My Subjects</h2>
        <div className="teacher-subjects-no-subjects">
          <FaBook className="teacher-subjects-no-subjects-icon" />
          <h3 className="teacher-subjects-no-subjects-title">No Subjects Assigned</h3>
          <p className="teacher-subjects-no-subjects-text">You haven't been assigned any subjects yet.</p>
          <p className="teacher-subjects-no-subjects-text">Please contact the administrator to get subjects and classes assigned to you.</p>
          <div className="teacher-subjects-contact-info">
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Wait for admin approval if your account is pending</li>
              <li>Contact the administrator for subject assignment</li>
              <li>Once assigned, you can start live classes for your subjects</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-subjects-wrapper">
      <div className="teacher-subjects-header">
        <h2 className="teacher-subjects-title">My Subjects</h2>
        <p className="teacher-subjects-description">Start live classes for your assigned subjects and classes</p>
      </div>

      <div className="teacher-subjects-info-card">
        <div className="teacher-subjects-info">
          <p className="teacher-subjects-count">You're assigned to teach {teacherSubjects.length} subject(s)</p>
        </div>

        {teacherLiveClasses.length > 0 && (
          <div className="teacher-subjects-live-banner">
            <h3 className="teacher-subjects-live-title">Your Active Classes -
              <span className="teacher-subjects-live-count">
                {teacherLiveClasses.length} class(es) currently running
              </span>
            </h3>
          </div>
        )}
      </div>

      <div className="teacher-subjects-grid">
        {teacherSubjects.map((subject, idx) => (
          <div className="teacher-subjects-card" key={idx}>
            <div className="teacher-subjects-image-container">
              <img src={subject.image} alt={subject.name} className="teacher-subjects-image" />
              <div className="teacher-subjects-overlay">
                <div className="teacher-subjects-icon">{subject.icon}</div>
              </div>
            </div>

            <div className="teacher-subjects-info-section">
              <div className="teacher-subjects-header-section">
                <h3 className="teacher-subjects-name">{subject.name}</h3>
                <span className="teacher-subjects-category">{subject.category}</span>
              </div>

              <div className="teacher-subjects-assigned-info">
                <p className="teacher-subjects-assigned-classes">
                  <strong>Assigned Classes:</strong> {subject.classes.length > 0 ? subject.classes.join(', ') : 'No classes assigned'}
                </p>
              </div>

              {subject.classes.length > 0 ? (
                <div className="teacher-subjects-class-controls">
                  {subject.classes.map(className => {
                    const isLive = isSubjectLive(subject.name, className);
                    const isStarting = startingClass === `${subject.name}-${className}`;

                    return (
                      <div key={className} className="teacher-subjects-class-item">
                        <div className="teacher-subjects-class-info">
                          <span className="teacher-subjects-class-label">{className}</span>
                          {isLive && (
                            <span className="teacher-subjects-live-status">
                              <FaCircle className="teacher-subjects-live-dot" />
                              LIVE
                            </span>
                          )}
                        </div>

                        <div className="teacher-subjects-class-actions">
                          {isLive ? (
                            <button
                              className="teacher-subjects-end-btn"
                              onClick={() => handleEndClass(subject, className)}
                            >
                              <FaStop /> End Class
                            </button>
                          ) : (
                            <button
                              className="teacher-subjects-start-btn"
                              onClick={() => handleStartClass(subject, className)}
                              disabled={isStarting}
                            >
                              {isStarting ? (
                                <>
                                  <FaSpinner className="teacher-subjects-spinning" />
                                  Starting...
                                </>
                              ) : (
                                <>
                                  <FaVideo /> Start Live Class
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="teacher-subjects-no-classes">
                  <p className="teacher-subjects-no-classes-text">No classes assigned for this subject</p>
                  <p className="teacher-subjects-help-text">Contact admin to get classes assigned</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherSubjects;
