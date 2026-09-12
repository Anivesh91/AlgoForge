import React from 'react';
import { Terminal, AlertCircle } from 'lucide-react';

export default function ConsolePanel({ output = '', error = '' }) {
  const content = error || output;

  return (
    <div className="flex flex-col h-full bg-dark-900 overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-600 bg-dark-900 text-gray-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold font-sans text-gray-300">Standard Output & Diagnostics</span>
        </div>
        <span className="text-[10px] text-gray-500 font-sans">
          Max output cap: 256 KB
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-dark-900 text-gray-300 select-text whitespace-pre-wrap leading-relaxed">
        {content ? (
          <div className={error ? 'text-rose-400' : 'text-gray-300'}>
            {content}
          </div>
        ) : (
          <div className="text-gray-600 italic">
            Console output will appear here after code compilation and test execution.
          </div>
        )}
      </div>
    </div>
  );
}
