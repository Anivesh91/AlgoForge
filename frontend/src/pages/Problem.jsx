import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkspaceLayout from '../components/workspace/WorkspaceLayout';
import { getProblemById, saveDraft, toggleSaveProblem } from '../services/problem.api';
import { executeProblem } from '../services/execution.api';
import {
  getConversation,
  askHint,
  sendChatMessage,
  clearConversation,
} from '../services/tutor.api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Problem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const debounceTimerRef = useRef(null);
  const draftRevisionRef = useRef(0);
  const saveQueueRef = useRef(Promise.resolve());

  // Load problem details and stored conversation from backend
  useEffect(() => {
    let isMounted = true;
    const requestedProblemId = id;
    const loadProblemAndChat = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProblemById(id);
        if (isMounted) {
          setProblem(data);
          setCode(data.latestDraftCode ?? data.starterCode);
          if (data.updatedAt) {
            setLastSavedAt(data.updatedAt);
          }

          // Fetch stored conversation history
          try {
            const chatData = await getConversation(id);
            if (!isMounted || requestedProblemId !== id) return;
            if (chatData?.messages && chatData.messages.length > 0) {
              setChatMessages(chatData.messages);
            } else {
              setChatMessages([
                {
                  role: 'assistant',
                  type: 'chat',
                  content: `Problem loaded: "${data.title}". How can I help you approach this challenge? Ask for progressive hints or code debugging advice anytime.`,
                },
              ]);
            }
          } catch (chatErr) {
            if (!isMounted || requestedProblemId !== id) return;
            setChatMessages([
              {
                role: 'assistant',
                type: 'chat',
                content: `Problem loaded: "${data.title}". How can I help you approach this problem?`,
              },
            ]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load problem');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProblemAndChat();
    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [id]);

  // Debounced draft autosave to backend
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setIsSaving(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const revision = ++draftRevisionRef.current;
    debounceTimerRef.current = setTimeout(() => {
      saveQueueRef.current = saveQueueRef.current.then(async () => {
        try {
          const response = await saveDraft(id, newCode, revision);
          if (response.revision === revision) {
            setLastSavedAt(response.updatedAt || Date.now());
            setSaveError(null);
          }
        } catch (err) {
          console.error('Failed to autosave draft:', err);
          setSaveError(err.message || 'Draft autosave failed');
        } finally {
          if (revision === draftRevisionRef.current) setIsSaving(false);
        }
      });
    }, 800);
  };

  const handleResetCode = () => {
    if (problem) {
      handleCodeChange(problem.starterCode);
    }
  };

  const handleSaveToggle = async () => {
    try {
      const res = await toggleSaveProblem(id, !problem.isSaved);
      setProblem((prev) => ({
        ...prev,
        isSaved: res.isSaved,
      }));
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleRun = async (customTests) => {
    setIsRunning(true);
    setRunResult(null);
    setSubmitResult(null);
    setConsoleOutput('Running solution in Docker sandbox...\n');
    try {
      const result = await executeProblem(id, { code, customTests });
      setRunResult({ type: 'run', ...result });
      setConsoleOutput((prev) => prev + `\nStatus: ${result.status}`);
    } catch (err) {
      setConsoleError(err.message || 'Execution failed');
    } finally { setIsRunning(false); }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    setRunResult(null);
    setConsoleOutput('Submitting to Docker sandbox...\n');
    try {
      const result = await executeProblem(id, { code, submit: true });
      setSubmitResult({ type: 'submit', ...result });
      setConsoleOutput((prev) => prev + `\nStatus: ${result.status}`);
    } catch (err) {
      setConsoleError(err.message || 'Submission failed');
    } finally { setIsSubmitting(false); }
  };

  const handleAskHint = async (level) => {
    setIsChatLoading(true);
    try {
      const res = await askHint(id, { code, hintLevel: level });
      if (res?.messages) {
        setChatMessages(res.messages);
      } else if (res?.hint) {
        setChatMessages((prev) => [
          ...prev,
          { role: 'user', type: 'hint', content: `Requesting Hint ${level}` },
          { role: 'assistant', type: 'hint', content: res.hint },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', type: 'chat', content: `⚠️ Failed to fetch hint: ${err.message}` },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendMessage = async (msg) => {
    setIsChatLoading(true);
    setChatMessages((prev) => [...prev, { role: 'user', type: 'chat', content: msg }]);
    try {
      const res = await sendChatMessage(id, { message: msg, code, type: 'chat' });
      if (res?.messages) {
        setChatMessages(res.messages);
      } else if (res?.reply) {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', type: 'chat', content: res.reply },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', type: 'chat', content: `⚠️ AI Tutor error: ${err.message}` },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearConversation(id);
      setChatMessages([]);
    } catch (err) {
      console.warn('Failed to clear chat:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading problem workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center bg-dark-900 p-4">
        <div className="max-w-md p-6 bg-dark-800 border border-dark-600 rounded-2xl text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Problem Not Found</h2>
          <p className="text-sm text-gray-400 mb-5">{error || 'Could not load the requested problem.'}</p>
          <button
            onClick={() => navigate('/workspace')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
          >
            Go to New Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      problem={problem}
      code={code}
      onCodeChange={handleCodeChange}
      onResetCode={handleResetCode}
      isGenerating={false}
      onGenerate={() => {}}
      onRun={handleRun}
      onSubmit={handleSubmit}
      isRunning={isRunning}
      isSubmitting={isSubmitting}
      runResult={runResult}
      submitResult={submitResult}
      consoleOutput={consoleOutput}
      consoleError={consoleError}
      saveError={saveError}
      isSaving={isSaving}
      lastSavedAt={lastSavedAt}
      onSaveToggle={handleSaveToggle}
      onRegenerate={() => navigate('/workspace')}
      onAskHint={handleAskHint}
      onSendMessage={handleSendMessage}
      onClearChat={handleClearChat}
      chatMessages={chatMessages}
      isChatLoading={isChatLoading}
    />
  );
}
