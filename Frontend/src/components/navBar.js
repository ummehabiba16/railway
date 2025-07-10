import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import api from "../api";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token); // Convert to boolean
    };

    checkAuthStatus();

    // Listen for storage changes (useful if user logs in/out in another tab)
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Make the logout request
      await api.post("/logout");
      
      // Clear token and userId from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      
      // Update the logged in state
      setIsLoggedIn(false);
      
      // Optional: Redirect to login
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg px-3 navbar-dark bg-dark">
      <span
        className="navbar-brand"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        {/* <img src="" alt="Logo" width="30" height="24" class="d-inline-block align-text-top">*/}
        Eticketing System
      </span>

      {/* Hamburger button */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      {/* Collapsible nav links */}
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <button
              className="btn btn-outline-light mx-1 my-1"
              onClick={() => navigate("/trainInfo")}
            >
              Train Info
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-outline-light mx-1 my-1"
              onClick={() => navigate("/search")}
            >
              Buy Tickets
            </button>
          </li>
          
          {/* Show Sign Up and Login only when user is NOT logged in */}
          {!isLoggedIn && (
            <>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light mx-1 my-1"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light mx-1 my-1"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </li>
            </>
          )}
          
          {/* Show My Bookings and Logout only when user IS logged in */}
          {isLoggedIn && (
            <>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light mx-1 my-1"
                  onClick={() => navigate("/bookings")}
                >
                  My bookings
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light mx-1 my-1"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;