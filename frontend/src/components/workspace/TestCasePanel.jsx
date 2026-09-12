import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Code2 } from 'lucide-react';

export default function TestCasePanel({ visibleTests = [], customTests = [], onUpdateCustomTests }) {
  const [selectedTab, setSelectedTab] = useState(0); // 0..visibleTests.length-1 or 'custom'
  const [customInputText, setCustomInputText] = useState(
    JSON.stringify({ nums: [3, -1, 2, 5, -4] }, null, 2)
  );
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    if (onUpdateCustomTests) {
      try {
        const parsed = JSON.parse(customInputText);
        onUpdateCustomTests([{ id: 'custom-1', input: parsed }]);
        setJsonError(null);
      } catch (err) {
        setJsonError(err.message);
        onUpdateCustomTests([]);
      }
    }
  }, []); // Run once on mount to sync default state

  const allVisible = visibleTests || [];

  return (
    <div className="flex flex-col h-full bg-dark-900 overflow-hidden text-xs">
      {/* Test Case Tab Headers */}
      <div className="flex items-center gap-1.5 px-4 pt-2 border-b border-dark-600 bg-dark-900 overflow-x-auto">
        {allVisible.map((test, index) => (
          <button
            key={test.id || index}
            onClick={() => setSelectedTab(index)}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition ${
              selectedTab === index
                ? 'bg-dark-800 text-blue-400 border-t border-x border-dark-600'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-850'
            }`}
          >
            Case {index + 1}
          </button>
        ))}

        <button
          onClick={() => setSelectedTab('custom')}
          className={`px-3 py-1.5 rounded-t-lg font-medium transition flex items-center gap-1 ${
            selectedTab === 'custom'
              ? 'bg-dark-800 text-purple-400 border-t border-x border-dark-600'
              : 'text-gray-400 hover:text-gray-200 hover:bg-dark-850'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Custom Test
        </button>
      </div>

      {/* Case Details Body */}
      <div className="flex-1 p-4 overflow-y-auto bg-dark-800 font-mono">
        {selectedTab === 'custom' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-gray-400 font-sans">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                Custom Test Input (JSON)
              </span>
              <span className="text-[11px] text-gray-500">
                Matches function parameter names
              </span>
            </div>
            <textarea
              rows={4}
              value={customInputText}
              onChange={(e) => {
                setCustomInputText(e.target.value);
                if (onUpdateCustomTests) {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onUpdateCustomTests([{ id: 'custom-1', input: parsed }]);
                    setJsonError(null);
                  } catch (err) {
                    setJsonError(err.message);
                    onUpdateCustomTests([]);
                  }
                }
              }}
              className={`w-full p-3 bg-dark-900 border ${
                jsonError ? 'border-red-500' : 'border-dark-600'
              } rounded-lg text-white font-mono text-xs focus:outline-none focus:border-purple-500`}
            />
            {jsonError && (
              <div className="text-red-400 text-[11px] mt-1">Invalid JSON: {jsonError}</div>
            )}
          </div>
        ) : (
          allVisible[selectedTab] && (
            <div className="space-y-3">
              <div>
                <div className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold font-sans mb-1">
                  Input
                </div>
                <div className="p-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 overflow-x-auto">
                  {typeof allVisible[selectedTab].input === 'object'
                    ? JSON.stringify(allVisible[selectedTab].input, null, 2)
                    : String(allVisible[selectedTab].input)}
                </div>
              </div>

              <div>
                <div className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold font-sans mb-1">
                  Expected Output
                </div>
                <div className="p-3 bg-dark-900 border border-dark-600 rounded-lg text-emerald-400 overflow-x-auto">
                  {typeof allVisible[selectedTab].expectedOutput === 'object'
                    ? JSON.stringify(allVisible[selectedTab].expectedOutput, null, 2)
                    : String(allVisible[selectedTab].expectedOutput)}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
