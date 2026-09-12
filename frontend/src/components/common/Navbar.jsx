import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Code2, Bookmark, History, User, LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="h-14 border-b border-dark-600 bg-dark-900/90 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-2 text-white font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <span>Algo<span className="text-blue-500">Forge</span></span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center space-x-1 text-sm font-medium text-gray-400">
            <Link to="/workspace" className="px-3 py-1.5 rounded-md hover:text-white hover:bg-dark-800 transition">
              Workspace
            </Link>
            <Link to="/history" className="px-3 py-1.5 rounded-md hover:text-white hover:bg-dark-800 transition flex items-center gap-1.5">
              <History className="w-4 h-4" /> History
            </Link>
            <Link to="/saved" className="px-3 py-1.5 rounded-md hover:text-white hover:bg-dark-800 transition flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" /> Saved
            </Link>
            <Link to="/submissions" className="px-3 py-1.5 rounded-md hover:text-white hover:bg-dark-800 transition flex items-center gap-1.5">
              <Code2 className="w-4 h-4" /> Submissions
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {user ? (
          <div className="flex items-center space-x-3">
            <Link to="/profile" className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-dark-800 px-3 py-1.5 rounded-lg border border-dark-600">
              <User className="w-4 h-4 text-blue-400" />
              <span>{user.name}</span>
            </Link>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-dark-800 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-dark-800 transition font-medium"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-medium shadow-md shadow-blue-500/20 transition"
            >
              Start Practicing
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
