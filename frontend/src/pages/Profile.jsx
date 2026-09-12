import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Award, CheckCircle2, Code2, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, checkSession } = useAuth();

  useEffect(() => {
    if (checkSession) {
      checkSession();
    }
  }, [checkSession]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-dark-800 border border-dark-600 rounded-3xl p-8 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-sm text-gray-400 mb-4">{user.email}</p>
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-dark-900 px-3 py-1 rounded-full border border-dark-700">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Stats Cards */}
      <h2 className="text-lg font-bold text-white mb-4">Practice Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-dark-800 border border-dark-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Problems Solved
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {user.stats?.solvedProblems || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Accepted submissions</p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-800 border border-dark-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Problems Generated
            </span>
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {user.stats?.generatedProblems || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Custom C++ challenges created</p>
        </div>

        <div className="p-6 rounded-2xl bg-dark-800 border border-dark-600">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Submissions
            </span>
            <Code2 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {user.stats?.totalSubmissions || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">Hidden test evaluations</p>
        </div>
      </div>
    </div>
  );
}
