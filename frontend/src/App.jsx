import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Workspace from './pages/Workspace';
import Problem from './pages/Problem';
import History from './pages/History';
import Saved from './pages/Saved';
import Submissions from './pages/Submissions';
import Profile from './pages/Profile';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col font-sans">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/problem/:id" element={<Problem />} />
            <Route path="/history" element={<History />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
