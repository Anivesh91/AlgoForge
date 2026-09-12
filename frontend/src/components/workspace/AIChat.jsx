import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  HelpCircle,
  Loader2,
  Bot,
  User,
  Trash2,
  Code2,
  Clock,
  Bug,
  Lightbulb,
} from 'lucide-react';

export default function AIChat({
  problem,
  messages = [],
  onAskHint,
  onSendMessage,
  onClearChat,
  isLoading,
}) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive or when loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleHintClick = (level) => {
    if (isLoading) return;
    onAskHint(level);
  };

  const handleQuickAction = (actionText) => {
    if (isLoading) return;
    onSendMessage(actionText);
  };

  // Helper to format simple markdown-like elements (bold, code blocks, inline code)
  const formatContent = (content) => {
    if (!content) return '';

    // Split code blocks ```...```
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim();
        // Remove optional language identifier on first line (e.g. cpp)
        const codeText = lines.replace(/^(cpp|c\+\+|json|text)\n/i, '');
        return (
          <pre
            key={index}
            className="my-2 p-2.5 rounded-lg bg-dark-950 border border-dark-700/60 font-mono text-[11px] text-blue-300 overflow-x-auto select-text"
          >
            <code>{codeText}</code>
          </pre>
        );
      }

      // Handle simple inline formatting
      return (
        <span key={index} className="select-text leading-relaxed">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3 select-text">
      {/* Learning Mode Banner with Clear Chat Button */}
      <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs text-blue-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="font-semibold text-blue-200">AlgoForge AI Tutor</span>
        </div>
        {onClearChat && messages.length > 1 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear conversation history for this problem?')) {
                onClearChat();
              }
            }}
            title="Clear Chat History"
            className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-dark-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progressive Hints & Quick Prompts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
          <span className="flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Progressive Hints
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleHintClick(1)}
            disabled={isLoading}
            className="text-xs p-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-gray-300 text-left transition disabled:opacity-50"
          >
            <div className="font-semibold text-blue-400 text-[11px]">Hint 1</div>
            <div className="text-[10px] text-gray-400 truncate">Concept / Direction</div>
          </button>
          <button
            type="button"
            onClick={() => handleHintClick(2)}
            disabled={isLoading}
            className="text-xs p-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-gray-300 text-left transition disabled:opacity-50"
          >
            <div className="font-semibold text-amber-400 text-[11px]">Hint 2</div>
            <div className="text-[10px] text-gray-400 truncate">Approach & Algo</div>
          </button>
          <button
            type="button"
            onClick={() => handleHintClick(3)}
            disabled={isLoading}
            className="text-xs p-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-gray-300 text-left transition disabled:opacity-50"
          >
            <div className="font-semibold text-rose-400 text-[11px]">Hint 3</div>
            <div className="text-[10px] text-gray-400 truncate">Edge Cases / Logic</div>
          </button>
        </div>

        {/* Quick Diagnostic Action Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleQuickAction('Explain my current code draft and how it works.')}
            disabled={isLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-dark-800 hover:bg-dark-700 border border-dark-600 text-[11px] text-gray-300 hover:text-white transition disabled:opacity-50"
          >
            <Code2 className="w-3 h-3 text-blue-400" />
            <span>Explain My Code</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickAction('Analyze the time and space complexity of my current code.')}
            disabled={isLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-dark-800 hover:bg-dark-700 border border-dark-600 text-[11px] text-gray-300 hover:text-white transition disabled:opacity-50"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Analyze Complexity</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickAction('Check my code draft for subtle bugs, syntax errors, or off-by-one boundary traps.')}
            disabled={isLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-dark-800 hover:bg-dark-700 border border-dark-600 text-[11px] text-gray-300 hover:text-white transition disabled:opacity-50"
          >
            <Bug className="w-3 h-3 text-emerald-400" />
            <span>Find Potential Bugs</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[180px] max-h-[420px]">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs">
            <HelpCircle className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            Ask any question about the problem or request a hint to get unstuck.
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 text-xs ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role !== 'user' && (
                <div className="w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : msg.type === 'hint'
                    ? 'bg-dark-800 border border-amber-500/30 text-gray-200 rounded-bl-none shadow-sm'
                    : 'bg-dark-800 border border-dark-600 text-gray-200 rounded-bl-none'
                }`}
              >
                {formatContent(msg.content)}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-md bg-dark-700 text-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-400 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>AI Tutor is formulating guidance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input box */}
      <form onSubmit={handleSend} className="relative pt-1">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question or request a clue..."
          disabled={isLoading}
          className="w-full pl-3 pr-10 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="absolute right-2 top-3 text-blue-400 hover:text-blue-300 disabled:opacity-30 p-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
