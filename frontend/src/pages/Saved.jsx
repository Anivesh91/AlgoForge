import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProblems, toggleSaveProblem } from '../services/problem.api';
import { Bookmark, ArrowRight, Loader2, BookmarkX } from 'lucide-react';

export default function Saved() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProblems({ saved: true });
      setProblems(data?.items || data || []);
    } catch (err) {
      setError(err.message || 'Failed to load saved problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUnsave = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleSaveProblem(id, false);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to update saved problem');
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
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Saved Problems</h1>
        </div>
        <p className="text-sm text-gray-400">
          Bookmarked C++ problems you want to revisit or master.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {problems.length === 0 && !error ? (
        <div className="p-12 text-center bg-dark-800/50 border border-dark-600 rounded-2xl max-w-xl mx-auto">
          <BookmarkX className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Saved Problems</h3>
          <p className="text-sm text-gray-400 mb-6">
            You haven't bookmarked any challenges yet. Click the bookmark icon on any problem in your workspace to save it here.
          </p>
          <Link
            to="/history"
            className="px-6 py-2.5 bg-dark-800 hover:bg-dark-700 text-gray-200 border border-dark-600 rounded-xl text-sm font-semibold transition inline-flex items-center gap-2"
          >
            Browse History
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
                  <button
                    onClick={(e) => handleUnsave(prob._id, e)}
                    className="p-1.5 rounded-lg text-amber-400 hover:bg-dark-700 transition"
                    title="Remove from Saved"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
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
