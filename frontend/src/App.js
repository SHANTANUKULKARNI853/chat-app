import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <HomePage /> : <AuthPage />} />
    </Routes>
  );
};

export default App;
