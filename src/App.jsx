import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ChatPage from './components/ChatPage';
import MainTabs from './components/MainTabs';

function App() {
  // Placeholder: use real auth state in production
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    navigate('/chat');
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/chat" element={token ? <MainTabs token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={token ? "/chat" : "/login"} />} />
    </Routes>
  );
}

export default App;
