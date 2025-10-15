import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = `${API_BASE_URL}/api/${role}/login`;
      const response = await axios.post(endpoint, formData);
      
      console.log('Login response:', response.data); // Debug log

      if (response.data.success) {
        // Check approval status for teacher
        if (role === 'teacher' && !response.data.teacher.isApproved) {
          setError('Your account is pending approval by the admin.');
          setLoading(false);
          return;
        }

        // Store data based on role
        if (role === 'teacher') {
          // Store teacher data specifically
          localStorage.setItem('teacher', JSON.stringify(response.data.teacher));
          localStorage.setItem('userRole', 'teacher');
          
          console.log('Stored teacher data:', response.data.teacher); // Debug log
          
          navigate('/teacher-dashboard');
        } else if (role === 'student') {
          // FIXED: Create proper student object with name property
          const studentData = {
            ...response.data.student,
            // Create name property from firstName and lastName
            name: response.data.student.firstName && response.data.student.lastName 
              ? `${response.data.student.firstName} ${response.data.student.lastName}`
              : response.data.student.firstName || response.data.student.lastName || response.data.student.email?.split('@')[0] || 'Student'
          };
          
          // Store student data specifically
          localStorage.setItem('student', JSON.stringify(studentData));
          localStorage.setItem('userRole', 'student');
          
          console.log('Stored student data:', studentData); // Debug log
          
          navigate('/student-dashboard');
        } else if (role === 'admin') {
          // Store admin data specifically
          localStorage.setItem('admin', JSON.stringify(response.data.admin));
          localStorage.setItem('userRole', 'admin');
          
          navigate('/admin-dashboard');
        }

        // Also store general user data for backward compatibility
        localStorage.setItem('user', JSON.stringify(response.data));
        
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 403 && err.response?.data?.needsApproval) {
        setError('Your account is pending admin approval. Please wait for approval.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <h1>Welcome back!</h1>
        <p>You can sign in to access with your existing account.</p>
      </div>
      <div className="login-right">
        <div className="login-container">
          <h2>Sign In</h2>
          <div className="role-tabs">
            <button
              className={role === 'admin' ? 'active' : ''}
              onClick={() => handleRoleChange('admin')}
            >
              Admin
            </button>
            <button
              className={role === 'teacher' ? 'active' : ''}
              onClick={() => handleRoleChange('teacher')}
            >
              Teacher
            </button>
            <button
              className={role === 'student' ? 'active' : ''}
              onClick={() => handleRoleChange('student')}
            >
              Student
            </button>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Username or email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div className="form-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
          <div className="login-footer">
            <p>
              New here?{' '}
              <a href={`/register/${role}`}>
                Create an Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
