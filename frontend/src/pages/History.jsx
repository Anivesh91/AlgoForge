import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProblems, deleteProblem, toggleSaveProblem } from '../services/problem.api';
import { History as HistoryIcon, Bookmark, Trash2, ArrowRight, Loader2, Sparkles, Code2 } from 'lucide-react';

export default function History() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProblems();
      setProblems(data.items || data);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this problem?')) return;

    try {
      await deleteProblem(id);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete problem');
    }
  };

  const handleSaveToggle = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const problem = problems.find((item) => item._id === id);
      const res = await toggleSaveProblem(id, !problem?.isSaved);
      setProblems((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isSaved: res.isSaved } : p))
      );
    } catch (err) {
      alert(err.message || 'Failed to update saved status');
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'hard':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'medium':
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HistoryIcon className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Practice History</h1>
          </div>
          <p className="text-sm text-gray-400">
            All AI-generated C++ challenges you have created and attempted.
          </p>
        </div>

        <Link
          to="/workspace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-500/20 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Generate New Problem
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {problems.length === 0 && !error ? (
        <div className="p-12 text-center bg-dark-800/50 border border-dark-600 rounded-2xl max-w-xl mx-auto">
          <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Problems Found</h3>
          <p className="text-sm text-gray-400 mb-6">
            You haven't generated any problems yet. Describe a concept to create your first customized challenge.
          </p>
          <Link
            to="/workspace"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition inline-flex items-center gap-2"
          >
            Start Practicing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((prob) => (
            <div
              key={prob._id}
              className="p-5 bg-dark-800 hover:bg-dark-750 border border-dark-600 hover:border-blue-500/40 rounded-2xl transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getDifficultyBadge(
                      prob.difficulty
                    )}`}
                  >
                    {prob.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleSaveToggle(prob._id, e)}
                      className={`p-1.5 rounded-lg hover:bg-dark-700 transition ${
                        prob.isSaved ? 'text-amber-400' : 'text-gray-500 hover:text-white'
                      }`}
                      title={prob.isSaved ? 'Remove from Saved' : 'Save'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(prob._id, e)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-dark-700 transition"
                      title="Delete Problem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Link to={`/problem/${prob._id}`} className="block">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-1.5">{prob.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{prob.description}</p>
                </Link>
              </div>

              <div className="pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs text-gray-500">
                <span>{prob.topic || 'General DSA'}</span>
                <span>{new Date(prob.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
