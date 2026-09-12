import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSubmissions } from '../services/submission.api';
import { Code2, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2, X, Eye } from 'lucide-react';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSubmissions();
        setSubmissions(data);
      } catch (err) {
        setError(err.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        );
      case 'WRONG_ANSWER':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Wrong Answer
          </span>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> TLE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Submission History</h1>
        </div>
        <p className="text-sm text-gray-400">
          All your C++ evaluation results and code runs against hidden test suites.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="p-12 text-center bg-dark-800/50 border border-dark-600 rounded-2xl max-w-xl mx-auto">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Submissions Yet</h3>
          <p className="text-sm text-gray-400 mb-6">
            When you click "Submit" in the workspace, your hidden evaluation records will appear here.
          </p>
          <Link
            to="/workspace"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
          >
            Go to Workspace
          </Link>
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-dark-900 border-b border-dark-600 text-xs uppercase font-semibold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Problem</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Passed</th>
                  <th className="py-3.5 px-6">Runtime</th>
                  <th className="py-3.5 px-6">Submitted</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-dark-750 transition">
                    <td className="py-4 px-6 font-medium text-white">
                      {sub.problemId ? (
                        <Link
                          to={`/problem/${sub.problemId._id}`}
                          className="hover:text-blue-400 transition"
                        >
                          {sub.problemId.title}
                        </Link>
                      ) : (
                        <span className="text-gray-500">Deleted Problem</span>
                      )}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(sub.status)}</td>
                    <td className="py-4 px-6 text-xs font-mono">
                      {sub.passedTests} / {sub.totalTests}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono">
                      {sub.runtimeMs} ms
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium p-1 rounded hover:bg-dark-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Inspection Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-dark-600 flex items-center justify-between bg-dark-900">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">
                  {selectedSub.problemId?.title || 'Submitted Code'}
                </span>
                {getStatusBadge(selectedSub.status)}
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-[#1e1e1e] flex-1 overflow-y-auto font-mono text-xs text-gray-200">
              <pre className="whitespace-pre-wrap">{selectedSub.code}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
