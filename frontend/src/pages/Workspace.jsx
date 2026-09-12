import React, { useState } from 'react';
import WorkspaceLayout from '../components/workspace/WorkspaceLayout';
import { MOCK_PROBLEM } from '../components/workspace/mockProblem';

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
      content: 'Hello! I am your AlgoForge AI coach. I can give you hints or answer questions about this problem.',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setIsSaving(true);
    // Simulate debounced draft autosave
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedAt(Date.now());
    }, 800);
  };

  const handleResetCode = () => {
    if (problem) {
      setCode(problem.starterCode);
    }
  };

  const handleGenerate = ({ prompt, difficulty, attachment }) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const newProblem = {
        ...MOCK_PROBLEM,
        _id: `problem-${Date.now()}`,
        title: `Custom ${difficulty} DSA Challenge`,
        userPrompt: prompt,
        difficulty,
      };
      setProblem(newProblem);
      setCode(newProblem.starterCode);
    }, 1500);
  };

  const handleRun = (customTests) => {
    setIsRunning(true);
    setRunResult(null);
    setSubmitResult(null);
    setConsoleOutput('Compiling Solution.cpp with g++ -std=c++17...\nCompilation successful.\nExecuting test harness on visible tests...\n');

    setTimeout(() => {
      setIsRunning(false);
      setRunResult({
        type: 'run',
        testResults: [
          {
            id: 'case-1',
            input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
            expectedOutput: 6,
            actualOutput: 6,
            passed: true,
          },
          {
            id: 'case-2',
            input: { nums: [1] },
            expectedOutput: 1,
            actualOutput: 1,
            passed: true,
          },
          {
            id: 'case-3',
            input: { nums: [5, 4, -1, 7, 8] },
            expectedOutput: 23,
            actualOutput: 23,
            passed: true,
          },
        ],
      });
      setConsoleOutput((prev) => prev + '\nAll 3 visible test cases completed execution.');
    }, 1200);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    setRunResult(null);
    setConsoleOutput('Compiling Solution.cpp for submission in isolated Docker container...\nRunning 25 hidden evaluation tests...\n');

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitResult({
        type: 'submit',
        status: 'ACCEPTED',
        passedTests: 25,
        totalTests: 25,
        runtimeMs: 12,
        memoryKb: 14200,
      });
      setConsoleOutput((prev) => prev + '\nStatus: ACCEPTED (Passed all 25 test cases)');
    }, 1500);
  };

  const handleSaveToggle = () => {
    setProblem((prev) => ({
      ...prev,
      isSaved: !prev.isSaved,
    }));
  };

  const handleRegenerate = () => {
    setProblem(null);
    setRunResult(null);
    setSubmitResult(null);
    setConsoleOutput('');
  };

  const handleAskHint = (level) => {
    setIsChatLoading(true);
    setTimeout(() => {
      setIsChatLoading(false);
      const hints = {
        1: 'Hint 1 (Concept): Consider whether you need all previous subarrays, or if Kadane\'s running sum algorithm allows an O(N) single pass.',
        2: 'Hint 2 (Approach): At each index i, decide whether to extend the current subarray sum (`current_sum + nums[i]`) or start fresh from `nums[i]`.',
        3: 'Hint 3 (Edge Case): Remember to handle cases where all numbers in `nums` are negative! In that case, the maximum subarray is simply the maximum single element.',
      };
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: hints[level] || 'Keep your complexity O(N).',
        },
      ]);
    }, 800);
  };

  const handleSendMessage = (msg) => {
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setIsChatLoading(true);
    setTimeout(() => {
      setIsChatLoading(false);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Regarding your question: "${msg}" — Look closely at how the current sum resets whenever it drops below zero. That ensures an optimal contiguous segment is tracked.`,
        },
      ]);
    }, 1000);
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
      chatMessages={chatMessages}
      isChatLoading={isChatLoading}
    />
  );
}
