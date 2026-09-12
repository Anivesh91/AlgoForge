import React, { useState } from 'react';
import { Bookmark, Sparkles, MessageSquare, BookOpen, RotateCcw, Check } from 'lucide-react';
import AIChat from './AIChat';

export default function ProblemPanel({
  problem,
  onSaveToggle,
  onRegenerate,
  onAskHint,
  onSendMessage,
  chatMessages,
  isChatLoading,
}) {
  const [activeTab, setActiveTab] = useState('description');

  if (!problem) {
    return null;
  }

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'medium':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border-r border-dark-600 select-text overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-dark-600 bg-dark-900/80 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getDifficultyBadge(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
          <h1 className="text-base font-bold text-white truncate tracking-tight">
            {problem.title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onSaveToggle && onSaveToggle(problem._id)}
            title={problem.isSaved ? 'Remove from Saved' : 'Save Problem'}
            className={`p-1.5 rounded-lg border transition ${
              problem.isSaved
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'text-gray-400 hover:text-white bg-dark-800 border-dark-600'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={onRegenerate}
            title="Generate New Problem"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-dark-800 border border-dark-600 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center border-b border-dark-600 bg-dark-900 px-4 text-xs font-medium text-gray-400">
        <button
          onClick={() => setActiveTab('description')}
          className={`py-2.5 px-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'description'
              ? 'text-blue-400 border-blue-500 font-semibold'
              : 'border-transparent hover:text-gray-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Description
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2.5 px-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === 'chat'
              ? 'text-blue-400 border-blue-500 font-semibold'
              : 'border-transparent hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          AI Guidance / Hints
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'description' ? (
          <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
            {/* Topic & Tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs bg-dark-800 text-gray-400 border border-dark-600 px-2 py-0.5 rounded-md font-medium">
                {problem.topic || 'Data Structures'}
              </span>
              {problem.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-dark-800/60 text-gray-400 border border-dark-700 px-2 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Problem Statement */}
            <div className="prose prose-invert max-w-none text-gray-200 whitespace-pre-line text-sm">
              {problem.description}
            </div>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Examples
                </h3>
                {problem.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-dark-800 border border-dark-600 font-mono text-xs space-y-1.5"
                  >
                    <div className="text-gray-400 font-semibold font-sans mb-1 text-[11px]">
                      Example {idx + 1}:
                    </div>
                    <div>
                      <span className="text-gray-500 select-none">Input: </span>
                      <span className="text-white">{ex.inputDisplay}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 select-none">Output: </span>
                      <span className="text-emerald-400">{ex.outputDisplay}</span>
                    </div>
                    {ex.explanation && (
                      <div className="pt-1 text-gray-400 text-[11px] font-sans border-t border-dark-700/60 mt-1">
                        <span className="font-semibold text-gray-300">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Constraints
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-300 font-mono bg-dark-800/40 p-3 rounded-xl border border-dark-700/60">
                  {problem.constraints.map((c, idx) => (
                    <li key={idx} className="leading-snug">
                      <span className="font-sans">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* C++ Target Function Spec */}
            {problem.functionSpec && (
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs">
                <span className="font-semibold text-blue-400">Target Signature: </span>
                <code className="text-gray-200 font-mono">
                  {problem.functionSpec.returnType} {problem.functionSpec.name}(
                  {problem.functionSpec.parameters
                    ?.map((p) => `${p.type} ${p.name}`)
                    .join(', ')}
                  )
                </code>
              </div>
            )}
          </div>
        ) : (
          <AIChat
            problem={problem}
            messages={chatMessages}
            onAskHint={onAskHint}
            onSendMessage={onSendMessage}
            isLoading={isChatLoading}
          />
        )}
      </div>
    </div>
  );
}
