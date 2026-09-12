import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-dark-800 border border-dark-600 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-sm text-gray-400 mb-6">Log in to access your AlgoForge workspace.</p>
        
        <div className="p-4 bg-dark-700/50 rounded-lg text-sm text-gray-300 border border-dark-600 mb-4">
          Auth module bootstrapping in progress...
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
