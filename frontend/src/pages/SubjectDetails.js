import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/SubjectDetails.css";

const subjectData = {
  English: {
    staff: "Ms. Priya",
    periods: 6,
    portions: [
      "Grammar",
      "Prose",
      "Poetry",
      "Comprehension",
      "Vocabulary",
    ],
  },
  Maths: {
    staff: "Mr. Kumar",
    periods: 7,
    portions: [
      "Algebra",
      "Geometry",
      "Trigonometry",
      "Statistics",
      "Mensuration",
    ],
  },
  Science: {
    staff: "Mrs. Lakshmi",
    periods: 6,
    portions: [
      "Physics Basics",
      "Chemistry Basics",
      "Biology",
      "Scientific Experiments",
    ],
  },
  Tamil: {
    staff: "Ms. Revathi",
    periods: 5,
    portions: ["Grammar", "Poetry", "Stories", "Writing Skills"],
  },
  Physics: {
    staff: "Mr. Arun",
    periods: 7,
    portions: ["Motion", "Force", "Energy", "Waves", "Electricity"],
  },
  Chemistry: {
    staff: "Mrs. Anitha",
    periods: 7,
    portions: ["Atoms", "Molecules", "Reactions", "Acids & Bases"],
  },
  "Computer Science": {
    staff: "Mr. Suresh",
    periods: 6,
    portions: ["C++", "Python", "Data Structures", "Networking"],
  },
  Accounts: {
    staff: "Ms. Meena",
    periods: 6,
    portions: ["Ledger", "Journal", "Trial Balance", "Final Accounts"],
  },
  Economics: {
    staff: "Mr. Ravi",
    periods: 5,
    portions: ["Demand", "Supply", "National Income", "Markets"],
  },
};

const SubjectDetails = () => {
  const { subjectName } = useParams();
  const navigate = useNavigate();

  
const formatSubjectName = (name) => {
  if (!name) return "";

  const map = {
    computerscience: "Computer Science",
    maths: "Maths",
    social: "Social",
    science: "Science",
    tamil: "Tamil",
    english: "English",
    physics: "Physics",
    chemistry: "Chemistry",
    botany: "Botany",
    zoology: "Zoology",
    economics: "Economics",
    accounts: "Accounts"
  };

  return map[name.toLowerCase()] || name;
};

const formattedName = formatSubjectName(subjectName);
const subject = subjectData[formattedName];

  if (!subject) {
    return <h2 style={{ textAlign: "center" }}>Subject not found</h2>;
  }

  return (
    <div className="subject-details-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>

      <h1>{formattedName}</h1>

      <div className="subject-info-card">
        <p><strong>Staff:</strong> {subject.staff}</p>
        <p><strong>Number of Periods:</strong> {subject.periods} per week</p>
      </div>

      <h3>Portions Covered</h3>
      <ul className="portion-list">
        {subject.portions.map((p, index) => (
          <li key={index}>{p}</li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectDetails;