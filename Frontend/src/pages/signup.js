import React, { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/navBar";
import { useNavigate } from "react-router-dom";

const Signup = () => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNum: "",
    nid: "",
    gender: "",
    address: "",
    birthRegNum: "",
    dateOfBirth: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      await api.post("/register", formData);
      setMessage("Registration successful!");
      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data || "Registration failed");
    }
  };

  return (
    <><Navbar />
    <div className="container mt-4">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {/* First Name */}
        <div className="mb-3">
          <label>First Name</label>
          <input type="text" name="firstName" className="form-control" onChange={handleChange} required />
        </div>
        {/* Last Name */}
        <div className="mb-3">
          <label>Last Name</label>
          <input type="text" name="lastName" className="form-control" onChange={handleChange} required />
        </div>
        {/* Email */}
        <div className="mb-3">
          <label>Email</label>
          <input type="email" name="email" className="form-control" onChange={handleChange} required />
        </div>
        {/* Phone Number */}
        <div className="mb-3">
          <label>Phone Number</label>
          <input type="text" name="phoneNum" className="form-control" onChange={handleChange} />
        </div>
        {/* NID */}
        <div className="mb-3">
          <label>NID</label>
          <input type="text" name="nid" className="form-control" onChange={handleChange} />
        </div>
        {/* Gender */}
        <div className="mb-3">
          <label>Gender</label>
          <select name="gender" className="form-control" onChange={handleChange}>
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
        {/* Address */}
        <div className="mb-3">
          <label>Address</label>
          <input type="text" name="address" className="form-control" onChange={handleChange} />
        </div>
        {/* Birth Reg Number */}
        <div className="mb-3">
          <label>Birth Reg. Number</label>
          <input type="text" name="birthRegNum" className="form-control" onChange={handleChange} />
        </div>
        {/* Date of Birth */}
        <div className="mb-3">
          <label>Date of Birth</label>
          <input type="date" name="dateOfBirth" className="form-control" onChange={handleChange} />
        </div>
        {/* Password */}
        <div className="mb-3">
          <label>Password</label>
          <input type="password" name="password" className="form-control" onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-primary">Register</button>
      </form>

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
    </>
  );
};

export default Signup;