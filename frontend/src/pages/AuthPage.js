import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsLogin((prevMode) => !prevMode);
    setEmail("");
    setPassword("");
    setUsername("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors

    try {
      if (isLogin) {
        await login(email, password); // Attempt login
      } else {
        await signup(username, email, password); // Attempt signup
      }
      navigate("/"); // Redirect to HomePage after success
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
      console.error("Authentication error:", error.message);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h1>Real-Time Chat App</h1>
        <h2>{isLogin ? "Log In" : "Sign Up"}</h2>

        {error && <p className="error-message">{error}</p>} {/* Display any error */}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
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
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Signup"}
          </button>
        </form>

        <div className="toggle-link">
          <p onClick={toggleAuthMode}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
