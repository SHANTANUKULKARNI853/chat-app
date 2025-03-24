import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage when the app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function (with email and password)
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error logging in");
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // Save user data after login
      const userData = { username: data.username, email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return data;
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
    }
  };

  // Signup function (with username, email, and password)
  const signup = async (username, email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating user");
      }

      const data = await response.json();
      console.log("Signup successful:", data.message);

      // Save user data after signup
      const userData = { username, email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return data;
    } catch (error) {
      console.error("Signup Error:", error.message);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
