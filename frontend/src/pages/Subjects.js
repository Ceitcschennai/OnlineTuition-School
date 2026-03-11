import React from 'react';
import '../styles/subjects.css';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaLaptopCode, FaCalculator } from 'react-icons/fa';
import { useLiveClass } from '../contexts/LiveClassContext';
import { joinJitsiMeeting } from '../utils/jitsiUtils';

// Images
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
import ComputerScience from '../assets/ComputerScience.jpeg';
import Accounts from '../assets/Accounts.jpeg';

const subjects = [
  { key: 'english', name: 'English', image: English, icon: <FaBook /> },
  { key: 'tamil', name: 'Tamil', image: Tamil, icon: <FaBook /> },
  { key: 'maths', name: 'Maths', image: Maths, icon: <FaCalculator /> },
  { key: 'science', name: 'Science', image: Science, icon: <FaBook /> },
  { key: 'social', name: 'Social', image: Social, icon: <FaBook /> },
  { key: 'physics', name: 'Physics', image: Physics, icon: <FaBook /> },
  { key: 'chemistry', name: 'Chemistry', image: Chemistry, icon: <FaBook /> },
  { key: 'botany', name: 'Botany', image: Botany, icon: <FaBook /> },
  { key: 'zoology', name: 'Zoology', image: Zoology, icon: <FaBook /> },
  { key: 'accounts', name: 'Accounts', image: Accounts, icon: <FaBook /> },
  { key: 'economics', name: 'Economics', image: Economics, icon: <FaBook /> },
  { key: 'cs', name: 'Computer Science', image: ComputerScience, icon: <FaLaptopCode /> }
];

const classSubjectsMap = {
  'Class 1': ['english','tamil','maths','science','social'],
  'Class 2': ['english','tamil','maths','science','social'],
  'Class 3': ['english','tamil','maths','science','social'],
  'Class 4': ['english','tamil','maths','science','social'],
  'Class 5': ['english','tamil','maths','science','social'],
  'Class 6': ['english','tamil','maths','science','social'],
  'Class 7': ['english','tamil','maths','science','social'],
  'Class 8': ['english','tamil','maths','science','social'],
  'Class 9': ['english','tamil','maths','science','social'],
  'Class 10': ['english','tamil','maths','science','social'],

  'Class 11': {
    'Bio-Maths': ['english','tamil','maths','physics','chemistry','botany','zoology'],
    'Computer Science': ['english','tamil','maths','physics','chemistry','cs'],
    'Commerce': ['english','tamil','accounts','economics']
  },

  'Class 12': {
    'Bio-Maths': ['english','tamil','maths','physics','chemistry','botany','zoology'],
    'Computer Science': ['english','tamil','maths','physics','chemistry','cs'],
    'Commerce': ['english','tamil','accounts','economics']
  }
};

const Subjects = () => {
  const navigate = useNavigate();
  const { liveClasses } = useLiveClass();

const student = JSON.parse(localStorage.getItem('user') || '{}');

  // 🔥 FIXED CLASS FORMAT
  let studentClass = student?.class?.trim();
  const studentGroup = student?.group?.trim();

  // Convert "1" → "Class 1"
  if (studentClass && !studentClass.startsWith("Class")) {
    studentClass = `Class ${studentClass}`;
  }

  let allowedSubjectKeys = [];

  if (!studentClass) {
    allowedSubjectKeys = subjects.map(sub => sub.key);
  }
  else if (studentClass === 'Class 11' || studentClass === 'Class 12') {
    allowedSubjectKeys =
      classSubjectsMap[studentClass]?.[studentGroup] || [];
  }
  else {
    allowedSubjectKeys =
      classSubjectsMap[studentClass] || [];
  }

  // Fallback safety
  
// If no subjects found, show empty list (do not show all)
if (!allowedSubjectKeys) {
  allowedSubjectKeys = [];
}
  console.log("Final Student Class:", studentClass);
  console.log("Student Group:", studentGroup);
  console.log("Allowed Subjects:", allowedSubjectKeys);

  const getLiveClassForSubject = (subjectName) => {
    return liveClasses.find(
      c =>
        c.subject === subjectName &&
        c.class === studentClass &&
        c.isLive
    );
  };

  return (
    <div className="student-subjects-wrapper">
      <h2>My Subjects</h2>

      <div className="student-subjects-list">
        {subjects
          .filter(sub => allowedSubjectKeys.includes(sub.key))
          .map((subject, idx) => {
            const liveClass = getLiveClassForSubject(subject.name);
            const isLive = !!liveClass;

            return (
              <div key={idx} className="student-subjects-card-horizontal">
                <img src={subject.image} alt={subject.name} />
                <h3>{subject.name}</h3>

                {isLive && <p style={{ color: 'red' }}>LIVE</p>}

                {isLive ? (
                  <button
                    onClick={() =>
                      joinJitsiMeeting(
                        liveClass.roomName,
                        student.firstName || "Student"
                      )
                    }
                  >
                    Join Live Class
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      navigate('/subject-details', {
                        state: { subjectName: subject.name }
                      })
                    }
                  >
                    View Details
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Subjects;