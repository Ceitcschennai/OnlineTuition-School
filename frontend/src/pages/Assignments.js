import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";
import "../styles/assignments.css";

const Assignments = () => {

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const student = JSON.parse(localStorage.getItem("user")) || {};
  const studentId = student?._id;

  //////////////////////////////////////////////////////////
  // Fetch Assignments
  //////////////////////////////////////////////////////////

  const fetchAssignments = async () => {

    try {

      if (!studentId) {
        setError("Student not logged in");
        return;
      }

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/assignments/student/${studentId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments);
      } else {
        setAssignments([]);
      }

    } catch (err) {

      console.error("Fetch error:", err);
      setError("Unable to load assignments");
      setAssignments([]);

    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////////
  // Load Assignments
  //////////////////////////////////////////////////////////

 useEffect(() => {

  fetchAssignments();

  const interval = setInterval(() => {
    fetchAssignments();
  }, 75000); // refresh every 5 seconds

  return () => clearInterval(interval);

}, []);
  //////////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////////

  return (

    <div className="assignment-dashboard">

      <h1>My Assignments</h1>

      {loading && <p>Loading assignments...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && assignments.length === 0 && (
        <p>No assignments available for your class.</p>
      )}

      {!loading &&
        assignments.map((assignment) => (

          <div key={assignment._id} className="assignment-card">

            <h3>{assignment.title}</h3>

            <p>
              <strong>Subject:</strong> {assignment.subject}
            </p>

            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(assignment.dueDate).toLocaleDateString()}
            </p>

            {assignment.priority && (
              <p>
                <strong>Priority:</strong> {assignment.priority}
              </p>
            )}

            {assignment.description && (
              <p>{assignment.description}</p>
            )}

          </div>

        ))}

    </div>
  );
};

export default Assignments;