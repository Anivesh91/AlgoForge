import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-600 bg-dark-900 py-6 px-4 text-center text-sm text-gray-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-gray-300">AlgoForge</span> &mdash; AI-Powered C++ Coding Practice Platform
        </div>
        <div>
          Built with React, Express, MongoDB, and Docker Sandbox.
        </div>
      </div>
    </footer>
  );
}
