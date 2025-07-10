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

      const response = await api.post('/login', credentials); // Change endpoint as needed
      setSuccess('Login successful!');
      setError('');
      const { userId, token } = response.data;
      localStorage.setItem('userId', userId);
      localStorage.setItem('token', token);
      console.log(response.data); // You might store token in localStorage here
      navigate('/'); //navigate to home page ???
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
