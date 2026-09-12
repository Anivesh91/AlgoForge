import React, { useState, useEffect } from 'react';
import WorkspaceLayout from '../components/workspace/WorkspaceLayout';
import { MOCK_PROBLEM } from '../components/workspace/mockProblem';
import { generateProblem, saveDraft, toggleSaveProblem } from '../services/problem.api';
import { executeProblem } from '../services/execution.api';
import {
  getConversation,
  askHint,
  sendChatMessage,
  clearConversation,
} from '../services/tutor.api';

export default function Workspace() {
  const [problem, setProblem] = useState(MOCK_PROBLEM);
  const [code, setCode] = useState(MOCK_PROBLEM.starterCode);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(Date.now());
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      type: 'chat',
      content: 'Hello! I am your AlgoForge AI coach. I can give you hints or answer questions about this problem.',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (window._draftSaveTimer) {
        clearTimeout(window._draftSaveTimer);
      }
    };
  }, []);

  // Load persisted conversation when problem changes
  useEffect(() => {
    let isActive = true;
    const capturedProblemId = problem?._id;
    if (problem?._id && !problem._id.startsWith('mock-')) {
      getConversation(problem._id)
        .then((data) => {
          if (!isActive || capturedProblemId !== problem?._id) return;
          if (data?.messages && data.messages.length > 0) {
            setChatMessages(data.messages);
          } else {
            setChatMessages([
              {
                role: 'assistant',
                type: 'chat',
                content: `Problem "${problem.title}" ready! I am your AlgoForge AI Coach. Ask for progressive hints or code guidance whenever you need help.`,
              },
            ]);
          }
        })
        .catch((err) => {
          console.warn('Failed to load conversation history:', err.message);
        });
    }
    return () => { isActive = false; };
  }, [problem?._id]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setIsSaving(true);

    if (problem?._id && !problem._id.startsWith('mock-')) {
      clearTimeout(window._draftSaveTimer);
      window._draftSaveTimer = setTimeout(async () => {
        try {
          await saveDraft(problem._id, newCode);
          setLastSavedAt(Date.now());
        } catch (err) {
          console.warn('Draft autosave failed:', err.message);
        } finally {
          setIsSaving(false);
        }
      }, 800);
    } else {
      setTimeout(() => {
        setIsSaving(false);
        setLastSavedAt(Date.now());
      }, 800);
    }
  };

  const handleResetCode = () => {
    if (problem) {
      setCode(problem.starterCode);
    }
  };

  const handleGenerate = async ({ prompt, difficulty }) => {
    setIsGenerating(true);
    try {
      setConsoleOutput(
        'Contacting AI problem generation engine...\nFormulating problem specifications, test cases, and reference solution...\nExecuting Phase 4 reference solution self-validation loop in Docker sandbox...\n'
      );
      setConsoleError('');

      const response = await generateProblem({
        prompt,
        difficulty,
        topic: 'Algorithms & Data Structures',
      });

      if (response) {
        const newProblem = response;
        setProblem(newProblem);
        setCode(newProblem.starterCode);
        setRunResult(null);
        setSubmitResult(null);
        setConsoleOutput(
          (prev) =>
            prev +
            `\nSuccess! Problem "${newProblem.title}" generated and validated with Docker sandbox.\nReady for your solution!`
        );
      }
    } catch (err) {
      console.error('Failed to generate problem:', err);
      const errMsg = err.message || 'Failed to generate problem.';
      setConsoleError(`Generation Error: ${errMsg}`);
      setConsoleOutput((prev) => prev + `\n[FAILED]: ${errMsg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRun = async (customTests) => {
    setIsRunning(true);
    setRunResult(null);
    setSubmitResult(null);
    try {
      if (problem._id.startsWith('mock-')) throw new Error('Generate a problem before running code.');
      const result = await executeProblem(problem._id, { code, customTests });
      setRunResult({ type: 'run', ...result });
      setConsoleOutput((prev) => prev + `\nStatus: ${result.status}`);
    } catch (err) { setConsoleError(err.message || 'Execution failed'); }
    finally { setIsRunning(false); }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    setRunResult(null);
    setConsoleOutput('Submitting to Docker sandbox...\n');
    try {
      if (problem._id.startsWith('mock-')) throw new Error('Generate a problem before submitting code.');
      const result = await executeProblem(problem._id, { code, submit: true });
      setSubmitResult({ type: 'submit', ...result });
      setConsoleOutput((prev) => prev + `\nStatus: ${result.status}`);
    } catch (err) { setConsoleError(err.message || 'Submission failed'); }
    finally { setIsSubmitting(false); }
  };

  const handleSaveToggle = async () => {
    if (!problem?._id || problem._id.startsWith('mock-')) return;
    try {
      const res = await toggleSaveProblem(problem._id, !problem.isSaved);
      if (res) {
        setProblem((prev) => ({
          ...prev,
          isSaved: res.isSaved,
        }));
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleRegenerate = () => {
    setProblem(null);
    setRunResult(null);
    setSubmitResult(null);
    setConsoleOutput('');
    setConsoleError('');
  };

  const handleAskHint = async (level) => {
    setIsChatLoading(true);
    try {
      if (problem?._id && !problem._id.startsWith('mock-')) {
        const res = await askHint(problem._id, { code, hintLevel: level });
        if (res?.messages) {
          setChatMessages(res.messages);
        } else if (res?.hint) {
          setChatMessages((prev) => [
            ...prev,
            { role: 'user', type: 'hint', content: `Requesting Hint ${level}` },
            { role: 'assistant', type: 'hint', content: res.hint },
          ]);
        }
      } else {
        const hints = {
          1: 'Hint 1 (Concept): Consider whether you need all previous subarrays, or if Kadane\'s running sum algorithm allows an O(N) single pass.',
          2: 'Hint 2 (Approach): At each index i, decide whether to extend the current subarray sum (`current_sum + nums[i]`) or start fresh from `nums[i]`.',
          3: 'Hint 3 (Edge Case): Remember to handle cases where all numbers in `nums` are negative! In that case, the maximum subarray is simply the maximum single element.',
        };
        setChatMessages((prev) => [
          ...prev,
          { role: 'user', type: 'hint', content: `Requesting Hint ${level}` },
          { role: 'assistant', type: 'hint', content: hints[level] || 'Keep your complexity O(N).' },
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
      if (problem?._id && !problem._id.startsWith('mock-')) {
        const res = await sendChatMessage(problem._id, { message: msg, code, type: 'chat' });
        if (res?.messages) {
          setChatMessages(res.messages);
        } else if (res?.reply) {
          setChatMessages((prev) => [
            ...prev,
            { role: 'assistant', type: 'chat', content: res.reply },
          ]);
        }
      } else {
        setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              type: 'chat',
              content: `Regarding: "${msg}" — Look closely at how the current sum resets whenever it drops below zero. That ensures an optimal contiguous segment is tracked.`,
            },
          ]);
        }, 600);
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
      if (problem?._id && !problem._id.startsWith('mock-')) {
        await clearConversation(problem._id);
      }
      setChatMessages([]);
    } catch (err) {
      console.warn('Failed to clear chat:', err.message);
    }
  };

  return (
    <WorkspaceLayout
      problem={problem}
      code={code}
      onCodeChange={handleCodeChange}
      onResetCode={handleResetCode}
      isGenerating={isGenerating}
      onGenerate={handleGenerate}
      onRun={handleRun}
      onSubmit={handleSubmit}
      isRunning={isRunning}
      isSubmitting={isSubmitting}
      runResult={runResult}
      submitResult={submitResult}
      consoleOutput={consoleOutput}
      consoleError={consoleError}
      isSaving={isSaving}
      lastSavedAt={lastSavedAt}
      onSaveToggle={handleSaveToggle}
      onRegenerate={handleRegenerate}
      onAskHint={handleAskHint}
      onSendMessage={handleSendMessage}
      onClearChat={handleClearChat}
      chatMessages={chatMessages}
      isChatLoading={isChatLoading}
    />
  );
}
