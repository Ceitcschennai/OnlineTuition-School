import React, { useState } from "react";
import axios from "axios";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password, role }
      );

      console.log("Login Response:", res.data);

      // Store token
      localStorage.setItem("token", res.data.token);

      // Store role
      localStorage.setItem("userRole", res.data.role);

      // Store full user object
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Store teacherId if role is teacher
      if (res.data.role === "teacher") {
        localStorage.setItem("teacherId", res.data.user._id);
      }

      // Redirect based on role
      if (res.data.role === "admin") {
        window.location.href = "/admin-dashboard";
      } else if (res.data.role === "teacher") {
        window.location.href = "/teacher-dashboard";
      } else {
        window.location.href = "/student-dashboard";
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        
        {/* LEFT SIDE */}
        <div className="login-left">
          <h1>Welcome back!</h1>
          <p>You can sign in to access your existing account.</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <h2>Login</h2>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            <button type="submit">Login</button>

            <h4>Default email: poojagokulan2306@gmail.com</h4>
            <h4>Default password: Pooja@2306</h4>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;