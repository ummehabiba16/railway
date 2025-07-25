import React, { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/navBar";
import { useNavigate } from "react-router-dom";

function Login() {
  
  const navigate = useNavigate();
  const[email, setEmail] = useState('');
  const[password, setPassword] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = credentials;

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      console.log(credentials);
      console.log(JSON.stringify(credentials));

      const response = await api.post("/login", credentials); // Change endpoint as needed
      setSuccess('Login successful!');
      setError('');
      
      const { userId, token } = response.data;
      
      // Store token and user ID in localStorage
      localStorage.setItem('userId', userId);
      localStorage.setItem('token', token);
      
      // Decode token to get role and store it securely
      // For better security, you could use sessionStorage instead of localStorage for sensitive data
      try {
        // Extract role from JWT token payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('userRole', payload.role);
        console.log('User role:', payload.role);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
      
      console.log(response.data);
      
      // Navigate based on role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Error navigating based on role:', err);
        navigate('/');
      }
    } catch (err) {
      setError('Login failed. Check credentials.'+ err);
      console.error(err);
    }
  };

  return (
    <><Navbar />
    <div className="container mt-5">
      <h3>Login</h3>
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
        <div className="mb-3">
          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password *</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
    </>
  );
}

export default Login;
