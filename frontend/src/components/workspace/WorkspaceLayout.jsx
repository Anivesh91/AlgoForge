import React, { useState } from 'react';
import { Play, Send, Terminal, CheckSquare, ListOrdered, ChevronDown, ChevronUp } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
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
  saveError,
  isSaving,
  lastSavedAt,
  onSaveToggle,
  onRegenerate,
  onAskHint,
  onSendMessage,
  onClearChat,
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

  const renderBottomToolbar = (hasTopBorder = false) => (
    <div className={`h-11 shrink-0 bg-dark-900 border-dark-600 px-4 flex items-center justify-between text-xs ${hasTopBorder ? 'border-t' : 'border-b'}`}>
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
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full flex bg-dark-900 select-none">
      {/* Ensure Tailwind doesn't break resizable behavior on mobile md breakpoints by using horizontal everywhere or conditionally, but let's stick to simple desktop for now */}
      <PanelGroup direction="horizontal" className="h-full w-full">
        {/* LEFT PANEL: Problem Statement or AI Generator Input */}
        <Panel defaultSize={45} minSize={20} className="flex flex-col h-full overflow-hidden">
          {problem ? (
            <ProblemPanel
              problem={problem}
              onSaveToggle={onSaveToggle}
              onRegenerate={onRegenerate}
              onAskHint={onAskHint}
              onSendMessage={onSendMessage}
              onClearChat={onClearChat}
              chatMessages={chatMessages}
              isChatLoading={isChatLoading}
            />
          ) : (
            <AIInput onGenerate={onGenerate} isGenerating={isGenerating} />
          )}
        </Panel>

        <PanelResizeHandle className="w-1.5 bg-dark-800 hover:bg-blue-500/50 active:bg-blue-500 transition-colors cursor-col-resize z-10 flex items-center justify-center">
          <div className="h-8 w-0.5 bg-gray-600 rounded-full" />
        </PanelResizeHandle>

        {/* RIGHT PANEL: Monaco Editor + Bottom Panels */}
        <Panel defaultSize={55} minSize={25} className="flex flex-col h-full border-l border-dark-600 bg-dark-900 overflow-hidden">
          <PanelGroup direction="vertical" className="flex-1">
            {/* Top: C++ Code Editor */}
            <Panel defaultSize={60} minSize={isBottomCollapsed ? 100 : 20} className="flex flex-col">
              <CodeEditor
                code={code}
                onChange={onCodeChange}
                onResetCode={onResetCode}
                isSaving={isSaving}
                lastSavedAt={lastSavedAt}
                saveError={saveError}
              />
            </Panel>

            {!isBottomCollapsed && (
              <>
                <PanelResizeHandle className="h-1.5 bg-dark-800 hover:bg-blue-500/50 active:bg-blue-500 transition-colors cursor-row-resize z-10 flex items-center justify-center">
                  <div className="w-8 h-0.5 bg-gray-600 rounded-full" />
                </PanelResizeHandle>
                
                {/* Bottom Panel */}
                <Panel defaultSize={40} minSize={15} className="flex flex-col bg-dark-900">
                  {renderBottomToolbar(false)}
                  
                  {/* Bottom Tabs Body */}
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
                </Panel>
              </>
            )}
          </PanelGroup>

          {isBottomCollapsed && renderBottomToolbar(true)}
        </Panel>
      </PanelGroup>
    </div>
  );
}
