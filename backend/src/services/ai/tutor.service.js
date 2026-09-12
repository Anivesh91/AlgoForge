const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Fallback progressive hints generator when AI provider is unavailable or offline
 */
function getFallbackHint(problem, hintLevel) {
  const topic = problem.topic || 'General DSA';
  const title = problem.title || 'this problem';

  switch (hintLevel) {
    case 1:
      return `💡 **Hint 1 (Conceptual Direction)**: 
Think about the core mathematical or algorithmic property of "${title}". 
Which fundamental paradigm fits best here? (e.g., Two Pointers, Sliding Window, Hash Table lookup, or Dynamic Programming). 
Consider what intermediate state you need to track as you traverse the data.`;

    case 2:
      return `💡 **Hint 2 (Approach & Data Structures)**:
For "${title}" (${topic}):
1. What is the brute-force time complexity? Can you reduce it by trading space for time with an efficient C++ STL container (such as \`std::unordered_map\` or \`std::priority_queue\`)?
2. Maintain a loop invariant: at each step $i$, what information from steps $0 \\dots i-1$ do you need to make an optimal decision in $O(1)$ or $O(\\log N)$?`;

    case 3:
      return `💡 **Hint 3 (Edge Cases & Boundaries)**:
Before finalizing your C++ code, check these critical boundaries:
- Empty or single-element inputs (e.g., \`nums.empty()\` or \`nums.size() == 1\`).
- Negative numbers or duplicate elements if applicable.
- Integer overflow: could intermediate sums exceed \`INT_MAX\`? Use \`long long\` if needed.
- Off-by-one errors when managing iterators or indices.`;

    default:
      return `Review the problem constraints and test your logic with a small manual walkthrough.`;
  }
}

/**
 * Fallback conversational reply
 */
function getFallbackChatReply(problem, userMessage, userCode) {
  const lower = (userMessage || '').toLowerCase();

  if (lower.includes('complexity') || lower.includes('time') || lower.includes('space') || lower.includes('big o')) {
    return `📊 **Complexity Guidance**:
Based on standard solutions for "${problem.title || 'this problem'}":
- **Optimal Time Complexity**: Typically $O(N)$ or $O(N \\log N)$ depending on whether sorting or hashing is used.
- **Optimal Space Complexity**: Typically $O(1)$ auxiliary space if done in-place, or $O(N)$ if using auxiliary hash tables or stacks.
Check your loops: Nested loops iterating over $N$ items yield $O(N^2)$, whereas a single pass with \`std::unordered_map\` achieves $O(N)$ on average.`;
  }

  if (lower.includes('explain') || lower.includes('my code') || lower.includes('review') || lower.includes('bug')) {
    if (!userCode || userCode.trim().length < 20) {
      return `I noticed your editor doesn't have much code yet. Write down your initial function approach or class template in Monaco, and I'll gladly analyze your logic and point out potential bugs!`;
    }
    return `🔍 **Code Review & Guidance**:
I reviewed your current code draft. Here are pointers to check:
1. **Signature & Return**: Ensure your function returns the expected type specified in the problem statement.
2. **Bounds & Base Cases**: Make sure you guard against empty collections before accessing elements by index (e.g. \`nums[0]\`).
3. **C++ Efficiency**: Pass large containers by reference (\`const vector<int>&\`) to prevent unnecessary $O(N)$ copies during function calls.`;
  }

  return `I'm your AlgoForge AI Coach for "${problem.title}". You can ask me for hints, help debugging an edge case, or an analysis of your current C++ implementation. What specific part would you like to explore?`;
}

/**
 * Fallback submission review
 */
function getFallbackSubmissionReview(problem, submission) {
  const isAccepted = submission.status === 'ACCEPTED';
  return `### 📋 AI Submission Code Review

**Verdict**: ${isAccepted ? '✅ Accepted Solution' : '⚠️ ' + submission.status}
**Problem**: ${problem.title} (${problem.difficulty})

#### 1. Algorithmic Approach
Your submission demonstrates a ${isAccepted ? 'working' : 'partial'} implementation for ${problem.topic || 'DSA'}.
${isAccepted 
  ? 'The solution correctly satisfies all visible and hidden constraints.' 
  : 'The logic should be reviewed against boundary test cases or potential edge cases.'}

#### 2. Complexity Analysis
- **Time Complexity**: $O(N)$ to $O(N \\log N)$ depending on inner loop operations.
- **Space Complexity**: $O(1)$ auxiliary space if in-place, or $O(N)$ if allocating auxiliary buffers.

#### 3. C++ Clean Code & Best Practices
- **Pass-by-reference**: Ensure large containers (vectors, strings) are passed as \`const &\` to avoid deep copying.
- **STL Usage**: Leverage idiomatic C++17 algorithms such as \`std::max_element\`, \`std::accumulate\`, or ranged-for loops where applicable.
- **Edge cases**: Verify your code handles zero-length, single-element, and maximum constraint values safely.`;
}

/**
 * Generates a progressive hint (Tier 1, 2, or 3) using Gemini or algorithmic fallback
 */
async function generateProgressiveHint({ problem, userCode = '', hintLevel = 1 }) {
  const apiKey = process.env.AI_API_KEY;
  const isMock = !apiKey || apiKey === 'mock_key_for_now' || apiKey.trim() === '';

  if (isMock) {
    return getFallbackHint(problem, hintLevel);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.AI_MODEL || 'gemini-3.6-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `You are the AlgoForge AI Tutor in strict Learning Mode.
Your mission is to provide progressive, Socratic hints for a C++ coding problem without spoiling the full solution or writing complete code.

Problem Title: "${problem.title}"
Difficulty: ${problem.difficulty}
Topic: ${problem.topic}
Problem Description:
${problem.description}

Constraints:
${(problem.constraints || []).join('\n')}

User's current C++ code draft:
\`\`\`cpp
${userCode || '// No code written yet'}
\`\`\`

Strict Hint Rules by Level:
- Level 1 (Conceptual): Give a conceptual clue about the mathematical insight or algorithmic pattern (e.g., Two Pointers, Dynamic Programming, Hash Map, Prefix Sum). Do NOT describe the full algorithm or give code.
- Level 2 (Approach): Explain the high-level strategy, data structure selection, and loop invariant. Outline the steps conceptually. Do NOT write full solution code.
- Level 3 (Edge Cases & Boundaries): Highlight tricky boundary conditions, off-by-one errors, overflow possibilities, or optimization bottlenecks without writing the answer.

CRITICAL POLICY:
- Never provide complete C++ solution code.
- Never mention hidden test cases.
- Use clean Markdown with KaTeX math syntax (e.g. $O(N)$) where relevant.
- Keep the hint focused, encouraging, and under 150 words.`;

    const prompt = `Please generate Hint Level ${hintLevel} for this problem based on the user's current code.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 350,
      },
    });

    const responseText = result.response.text();
    return responseText.trim() || getFallbackHint(problem, hintLevel);
  } catch (error) {
    console.warn(`[AI Tutor] Gemini hint generation failed (${error.message}). Using fallback hint.`);
    return getFallbackHint(problem, hintLevel);
  }
}

/**
 * Generates a conversational AI tutor response to a user question
 */
async function generateContextualReply({
  problem,
  userCode = '',
  userMessage = '',
  conversationHistory = [],
}) {
  const apiKey = process.env.AI_API_KEY;
  const isMock = !apiKey || apiKey === 'mock_key_for_now' || apiKey.trim() === '';

  if (isMock) {
    return getFallbackChatReply(problem, userMessage, userCode);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.AI_MODEL || 'gemini-3.6-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `You are the AlgoForge AI Tutor, an expert C++ coding coach.
You are helping a student solve the following DSA problem:
Title: "${problem.title}" (${problem.difficulty})
Topic: ${problem.topic}
Description:
${problem.description}

Constraints:
${(problem.constraints || []).join('\n')}

Student's current C++ code in the Monaco Editor:
\`\`\`cpp
${userCode || '// No code written yet'}
\`\`\`

Tutor Guidelines:
1. Socratic method: Guide the student with leading questions, conceptual explanations, and targeted debugging advice.
2. Code analysis: If the student asks about time/space complexity or bugs, analyze their current C++ code draft accurately and state the Big-O notations ($O(N)$, $O(1)$, etc.).
3. If they ask about C++ syntax or STL (e.g. \`std::unordered_map\`, iterators, references), explain clearly with short snippets.
4. Do NOT dump the full solution code unless the student has already accepted the problem or explicitly insists after multiple hints.
5. Format with readable Markdown, using bullet points and code formatting where helpful. Keep responses concise and focused.`;

    // Format recent history for context
    const recentMessages = conversationHistory.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: `Understood. I am ready to guide the student on "${problem.title}".` }] },
      ...recentMessages,
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 600,
      },
    });

    const responseText = result.response.text();
    return responseText.trim() || getFallbackChatReply(problem, userMessage, userCode);
  } catch (error) {
    console.warn(`[AI Tutor] Gemini chat reply failed (${error.message}). Using fallback reply.`);
    return getFallbackChatReply(problem, userMessage, userCode);
  }
}

/**
 * Generates an AI code review for a completed submission
 */
async function generateSubmissionReview({ problem, submission, focus = 'comprehensive' }) {
  const apiKey = process.env.AI_API_KEY;
  const isMock = !apiKey || apiKey === 'mock_key_for_now' || apiKey.trim() === '';

  if (isMock) {
    return getFallbackSubmissionReview(problem, submission);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.AI_MODEL || 'gemini-3.6-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const focusInstructions = {
      complexity: 'Focus primarily on time and space complexity, bottlenecks, and whether the approach meets the constraints.',
      clean_code: 'Focus primarily on readability, naming, structure, idiomatic C++17, maintainability, and unnecessary complexity.',
      comprehensive: 'Cover correctness, complexity, clean code, edge cases, and practical optimizations comprehensively.',
    }[focus] || 'Cover correctness, complexity, clean code, edge cases, and practical optimizations comprehensively.';
    const systemPrompt = `You are a Senior C++ Software Engineer conducting a thorough code review on AlgoForge.
The student submitted a solution for:
Problem: "${problem.title}" (${problem.difficulty})
Status: ${submission.status} (${submission.passedTests}/${submission.totalTests} tests passed)
Runtime: ${submission.runtimeMs || 0} ms
Review focus: ${focusInstructions}

Submitted C++ Code:
\`\`\`cpp
${submission.code}
\`\`\`

Provide a structured, helpful review in clean Markdown with the following sections:
1. ### 🔍 Approach & Correctness
   Brief evaluation of the algorithmic pattern used.
2. ### ⏱️ Complexity Analysis
   Accurate Time Complexity ($O(...)$) and Space Complexity ($O(...)$) breakdown with explanation.
3. ### 💡 Strengths & Clean Code
   What was done well (C++ STL usage, readability, naming, modern C++ practices).
4. ### 🚀 Optimizations & Best Practices
   Concrete suggestions for edge cases, memory footprint, or cache-friendly patterns.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 700,
      },
    });

    const responseText = result.response.text();
    return responseText.trim() || getFallbackSubmissionReview(problem, submission);
  } catch (error) {
    console.warn(`[AI Tutor] Submission review failed (${error.message}). Using fallback.`);
    return getFallbackSubmissionReview(problem, submission);
  }
}

module.exports = {
  generateProgressiveHint,
  generateContextualReply,
  generateSubmissionReview,
  getFallbackHint,
  getFallbackChatReply,
  getFallbackSubmissionReview,
};
