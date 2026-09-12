import React, { useState } from 'react';
import { Play, Send, Terminal, CheckSquare, ListOrdered, ChevronDown, ChevronUp } from 'lucide-react';
import ProblemPanel from './ProblemPanel';
import AIInput from './AIInput';
import CodeEditor from './CodeEditor';
import TestCasePanel from './TestCasePanel';
import ResultPanel from './ResultPanel';
import ConsolePanel from './ConsolePanel';

export default function WorkspaceLayout({
  problem,
  code,
  onCodeChange,
  onResetCode,
  isGenerating,
  onGenerate,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  runResult,
  submitResult,
  consoleOutput,
  consoleError,
  isSaving,
  lastSavedAt,
  onSaveToggle,
  onRegenerate,
  onAskHint,
  onSendMessage,
  chatMessages,
  isChatLoading,
}) {
  const [bottomTab, setBottomTab] = useState('testcases'); // 'testcases' | 'results' | 'console'
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [customTests, setCustomTests] = useState([]);

  const handleRunClick = () => {
    setBottomTab('results');
    onRun(customTests);
  };

  const handleSubmitClick = () => {
    setBottomTab('results');
    onSubmit();
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col md:flex-row bg-dark-900 overflow-hidden select-none">
      {/* LEFT PANEL: Problem Statement or AI Generator Input */}
      <div className="w-full md:w-1/2 h-full overflow-hidden flex flex-col">
        {problem ? (
          <ProblemPanel
            problem={problem}
            onSaveToggle={onSaveToggle}
            onRegenerate={onRegenerate}
            onAskHint={onAskHint}
            onSendMessage={onSendMessage}
            chatMessages={chatMessages}
            isChatLoading={isChatLoading}
          />
        ) : (
          <AIInput onGenerate={onGenerate} isGenerating={isGenerating} />
        )}
      </div>

      {/* RIGHT PANEL: Monaco Editor + Bottom Panels */}
      <div className="w-full md:w-1/2 h-full flex flex-col border-l border-dark-600 overflow-hidden">
        {/* Top: C++ Code Editor */}
        <div className={`transition-all duration-200 overflow-hidden ${isBottomCollapsed ? 'h-[calc(100%-2.75rem)]' : 'h-[60%]'}`}>
          <CodeEditor
            code={code}
            onChange={onCodeChange}
            onResetCode={onResetCode}
            isSaving={isSaving}
            lastSavedAt={lastSavedAt}
          />
        </div>

        {/* Bottom Panel Container */}
        <div className={`border-t border-dark-600 bg-dark-900 flex flex-col transition-all duration-200 ${isBottomCollapsed ? 'h-11' : 'h-[40%]'}`}>
          {/* Bottom Toolbar & Tabs */}
          <div className="h-11 bg-dark-900 border-b border-dark-600 px-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-medium">
              <button
                onClick={() => {
                  setBottomTab('testcases');
                  setIsBottomCollapsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  bottomTab === 'testcases' && !isBottomCollapsed
                    ? 'bg-dark-800 text-blue-400 font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Testcases</span>
              </button>

              <button
                onClick={() => {
                  setBottomTab('results');
                  setIsBottomCollapsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  bottomTab === 'results' && !isBottomCollapsed
                    ? 'bg-dark-800 text-emerald-400 font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Results</span>
              </button>

              <button
                onClick={() => {
                  setBottomTab('console');
                  setIsBottomCollapsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  bottomTab === 'console' && !isBottomCollapsed
                    ? 'bg-dark-800 text-amber-400 font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console</span>
              </button>

              <button
                onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                className="p-1 text-gray-500 hover:text-white ml-1"
                title={isBottomCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                {isBottomCollapsed ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Run / Submit Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunClick}
                disabled={isRunning || isSubmitting || !problem}
                className="px-3.5 py-1.5 bg-dark-800 hover:bg-dark-700 disabled:opacity-40 text-gray-200 border border-dark-600 rounded-lg font-semibold flex items-center gap-1.5 transition text-xs shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                <span>Run</span>
              </button>

              <button
                onClick={handleSubmitClick}
                disabled={isRunning || isSubmitting || !problem}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-semibold flex items-center gap-1.5 transition text-xs shadow-md shadow-emerald-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Bottom Tabs Body */}
          {!isBottomCollapsed && (
            <div className="flex-1 overflow-hidden">
              {bottomTab === 'testcases' && (
                <TestCasePanel
                  visibleTests={problem?.visibleTests || []}
                  customTests={customTests}
                  onUpdateCustomTests={setCustomTests}
                />
              )}

              {bottomTab === 'results' && (
                <ResultPanel
                  result={submitResult || runResult}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                />
              )}

              {bottomTab === 'console' && (
                <ConsolePanel
                  output={consoleOutput}
                  error={consoleError}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
