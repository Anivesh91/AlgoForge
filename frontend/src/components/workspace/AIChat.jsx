import React, { useState } from 'react';
import { Send, Sparkles, HelpCircle, AlertCircle, Loader2, Bot, User } from 'lucide-react';

export default function AIChat({ problem, messages = [], onAskHint, onSendMessage, isLoading }) {
  const [inputMessage, setInputMessage] = useState('');
  const [currentHintLevel, setCurrentHintLevel] = useState(1);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleHintClick = (level) => {
    if (isLoading) return;
    onAskHint(level);
    setCurrentHintLevel(Math.min(3, level + 1));
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Learning Mode Banner */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
        <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-200">Learning Mode Active: </span>
          The AI will provide progressive algorithmic hints and debugging cues without immediately spoiling full solutions.
        </div>
      </div>

      {/* Quick Progressive Hint Buttons */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
          Progressive Hints
        </div>
        <div className="grid grid-cols-3 gap-2">
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
      </div>

      {/* Messages Thread */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[160px]">
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
                    : 'bg-dark-800 border border-dark-600 text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.content}
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
            <span>AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Chat input box */}
      <form onSubmit={handleSend} className="relative pt-2">
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
          className="absolute right-2 top-4 text-blue-400 hover:text-blue-300 disabled:opacity-30 p-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
