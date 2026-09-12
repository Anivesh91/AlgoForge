import React, { useState } from 'react';
import { Sparkles, Paperclip, Loader2, ArrowRight } from 'lucide-react';
import ReferenceUpload from './ReferenceUpload';

export default function AIInput({ onGenerate, isGenerating }) {
  const [prompt, setPrompt] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [showUpload, setShowUpload] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [referenceMode, setReferenceMode] = useState('convert');

  const quickPrompts = [
    'Subarray sum with continuous elements',
    'Container with most water problem',
    'Two pointers on palindrome string',
    'LRU Cache implementation',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate({ prompt: prompt.trim(), difficulty, attachment, referenceMode });
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 p-6 overflow-y-auto">
      <div className="max-w-xl mx-auto w-full my-auto py-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            AI Problem Generator
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          What problem do you want to practice?
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Describe an idea, pattern, or upload an assignment screenshot. AlgoForge will construct a complete C++ challenge.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative bg-dark-800 border border-dark-600 rounded-2xl p-3 focus-within:border-blue-500 transition">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Give me a medium array problem involving continuous segments and kadane's algorithm..."
              className="w-full bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none resize-none"
              disabled={isGenerating}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-dark-700/60 mt-2">
              {/* Difficulty selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium mr-1">Difficulty:</span>
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : diff === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Reference upload button */}
              <button
                type="button"
                onClick={() => setShowUpload(!showUpload)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition ${
                  attachment || showUpload
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                {attachment ? 'File Attached' : 'Attach Reference'}
              </button>
            </div>
          </div>

          {showUpload && (
            <ReferenceUpload
              attachment={attachment}
              onSelect={setAttachment}
              referenceMode={referenceMode}
              onModeChange={setReferenceMode}
              onClose={() => setShowUpload(false)}
            />
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-xs text-gray-500">
              C++17 • Isolated Docker Judge
            </span>

            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating C++ Problem...
                </>
              ) : (
                <>
                  Generate Challenge
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick prompt suggestions */}
        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
            Or try these ideas:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(qp)}
                className="text-xs text-gray-300 bg-dark-800 hover:bg-dark-700 border border-dark-600 px-3 py-1.5 rounded-lg transition"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
