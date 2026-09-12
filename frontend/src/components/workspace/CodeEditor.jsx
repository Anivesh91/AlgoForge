import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, CheckCircle2, Cloud, Code } from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  onResetCode,
  isSaving,
  lastSavedAt,
}) {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleReset = () => {
    if (window.confirm('Reset code to starter template? Your current changes will be replaced.')) {
      onResetCode();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      {/* Editor Header Bar */}
      <div className="h-10 bg-dark-900 border-b border-dark-600 px-4 flex items-center justify-between text-xs text-gray-400 select-none">
        <div className="flex items-center gap-2 font-medium">
          <Code className="w-4 h-4 text-blue-400" />
          <span className="text-gray-200">Solution.cpp</span>
          <span className="text-gray-600">|</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-dark-800 border border-dark-700 text-blue-400 font-mono">
            C++17
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Autosave draft indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            {isSaving ? (
              <>
                <Cloud className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>Saving draft...</span>
              </>
            ) : lastSavedAt ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            ) : null}
          </div>

          <button
            onClick={handleReset}
            title="Reset code to starter"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-700 text-gray-300 border border-dark-600 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language="cpp"
          theme="vs-dark"
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 14,
            lineHeight: 22,
            tabSize: 4,
            insertSpaces: true,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            folding: true,
            glyphMargin: false,
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 },
            suggestOnTriggerCharacters: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}
