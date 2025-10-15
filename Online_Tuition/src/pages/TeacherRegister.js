import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/register.css'; 

const TeacherRegister = () => {
  const [form, setForm] = useState({
    salutation: 'Mr.',
    firstName: '',
    lastName: '',
    mobile: '',
    timezone: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferredSubject: ''
  });

  const [degreeFile, setDegreeFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setDegreeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    if (degreeFile) {
      formData.append('degreeCertificate', degreeFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/register`, {
        method: 'POST',
        body: formData // REMOVE headers
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Wait for admin approval.");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      alert("Error connecting to server");
      console.error(error);
    }
  };

  return (
    <div className="register-page">
      <div className="register-form">
        <h2>Register as Teacher</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="name-fields">
            <input
              type="text"
              name="salutation"
              placeholder="Mr./Ms."
              value={form.salutation}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              required
            />
          </div>
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            onChange={handleChange}
            required
          />
          <select
            name="timezone"
            onChange={handleChange}
            required
          >
            <option value="">- Select Timezone -</option>
            <option value="IST">India Standard Time (IST)</option>
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Standard Time (EST)</option>
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="preferredSubject"
            placeholder="Preferred Subject (e.g., Maths, English)"
            onChange={handleChange}
            required
          />
          <label style={{ marginTop: "10px" }}>
            Upload Degree Certificate (B.Ed, M.Ed, etc.):
          </label>
          <input
            type="file"
            name="degreeCertificate"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}

          />
          <button type="submit">Register</button>
          <div className="register-footer">
            <div className="login-link">
              <a href="/login">Already a User? Continue Here</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherRegister;
