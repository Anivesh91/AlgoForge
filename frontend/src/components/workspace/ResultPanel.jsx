import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Cpu, Play } from 'lucide-react';

export default function ResultPanel({ result, isSubmitting, isRunning }) {
  const [selectedCaseTab, setSelectedCaseTab] = useState(0);
  useEffect(() => setSelectedCaseTab(0), [result]);

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 bg-dark-850">
        <Clock className="w-8 h-8 text-blue-400 animate-spin mb-3" />
        <p className="text-sm font-semibold text-white">Running visible test cases...</p>
        <p className="text-xs text-gray-500 mt-1">Executing C++ code in Docker sandbox</p>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 bg-dark-850">
        <Clock className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-sm font-semibold text-white">Evaluating hidden test suite...</p>
        <p className="text-xs text-gray-500 mt-1">Testing edge cases and complexity limits</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500 bg-dark-850">
        <Play className="w-8 h-8 text-gray-600 mb-2" />
        <p className="text-xs">Run or Submit your solution to view evaluation results.</p>
      </div>
    );
  }

  const isSubmitResult = result.type === 'submit' || !!result.status;

  // Format Status Styling
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          title: 'Accepted',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        };
      case 'WRONG_ANSWER':
        return {
          title: 'Wrong Answer',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30',
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
        };
      case 'TIME_LIMIT_EXCEEDED':
        return {
          title: 'Time Limit Exceeded (TLE)',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30',
          icon: <Clock className="w-5 h-5 text-amber-400" />,
        };
      case 'COMPILATION_ERROR':
        return {
          title: 'Compilation Error',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
        };
      default:
        return {
          title: status || 'Runtime Error',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
        };
    }
  };

  const statusInfo = getStatusDisplay(result.status);

  return (
    <div className="flex flex-col h-full bg-dark-850 overflow-hidden text-xs">
      {/* Submit Verdict Summary Header */}
      {isSubmitResult && (
        <div className={`p-4 border-b border-dark-600 ${statusInfo.bg} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <h2 className={`text-base font-bold ${statusInfo.color}`}>
                {statusInfo.title}
              </h2>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {result.passedTests !== undefined && (
                  <span>
                    Passed {result.passedTests} / {result.totalTests} test cases
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-300 font-mono text-xs">
            {result.runtimeMs !== undefined && (
              <div className="flex items-center gap-1.5 bg-dark-900/60 px-3 py-1.5 rounded-lg border border-dark-700/50">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{result.runtimeMs} ms</span>
              </div>
            )}
            {result.memoryKb !== undefined && (
              <div className="flex items-center gap-1.5 bg-dark-900/60 px-3 py-1.5 rounded-lg border border-dark-700/50">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>{(result.memoryKb / 1024).toFixed(1)} MB</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Per-case results for Run */}
      {result.testResults && result.testResults.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Case tab headers */}
          <div className="flex items-center gap-1.5 px-4 pt-2 border-b border-dark-600 bg-dark-900 overflow-x-auto">
            {result.testResults.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCaseTab(idx)}
                className={`px-3 py-1.5 rounded-t-lg font-medium flex items-center gap-1.5 transition ${
                  selectedCaseTab === idx
                    ? 'bg-dark-800 text-white border-t border-x border-dark-600'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    t.passed ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
                <span>Case {idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Active Case Details */}
          {result.testResults[selectedCaseTab] && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono">
              <div>
                <span className="text-[11px] font-sans font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Input:
                </span>
                <div className="p-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-200 overflow-x-auto">
                  {typeof result.testResults[selectedCaseTab].input === 'object'
                    ? JSON.stringify(result.testResults[selectedCaseTab].input, null, 2)
                    : String(result.testResults[selectedCaseTab].input)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-sans font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Your Output:
                  </span>
                  <div
                    className={`p-3 bg-dark-900 border rounded-lg overflow-x-auto ${
                      result.testResults[selectedCaseTab].passed
                        ? 'border-emerald-500/40 text-emerald-400'
                        : 'border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {typeof result.testResults[selectedCaseTab].actualOutput === 'object'
                      ? JSON.stringify(result.testResults[selectedCaseTab].actualOutput, null, 2)
                      : String(result.testResults[selectedCaseTab].actualOutput ?? 'null')}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-sans font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Expected Output:
                  </span>
                  <div className="p-3 bg-dark-900 border border-dark-600 rounded-lg text-emerald-400 overflow-x-auto">
                    {typeof result.testResults[selectedCaseTab].expectedOutput === 'object'
                      ? JSON.stringify(result.testResults[selectedCaseTab].expectedOutput, null, 2)
                      : String(result.testResults[selectedCaseTab].expectedOutput ?? 'null')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
