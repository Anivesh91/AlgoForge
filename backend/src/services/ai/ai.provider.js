const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `
You are the AlgoForge Problem Generation Engine.
Your task is to generate a comprehensive, highly accurate Data Structures & Algorithms (DSA) problem in C++.
You MUST output ONLY a valid JSON object without any surrounding markdown code blocks, explanations, or extraneous text.

The JSON schema you must strictly adhere to is:
{
  "title": "Problem Title",
  "difficulty": "Easy" | "Medium" | "Hard",
  "topic": "Array / DP / Graph / etc.",
  "tags": ["tag1", "tag2"],
  "description": "Full Markdown problem statement describing the task, guarantees, and constraints.",
  "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
  "examples": [
    {
      "inputDisplay": "nums = [2, 7, 11, 15], target = 9",
      "outputDisplay": "[0, 1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  "functionSpec": {
    "name": "twoSum",
    "returnType": "vector<int>",
    "parameters": [
      { "name": "nums", "type": "vector<int>" },
      { "name": "target", "type": "int" }
    ]
  },
  "starterCode": "class Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        \\n    }\\n};",
  "supportCode": "",
  "visibleTests": [
    {
      "id": "case-1",
      "input": { "nums": [2, 7, 11, 15], "target": 9 },
      "expectedOutput": [0, 1]
    }
  ],
  "hiddenTests": [
    {
      "id": "hidden-1",
      "input": { "nums": [3, 2, 4], "target": 6 },
      "expectedOutput": [1, 2]
    }
  ],
  "referenceSolution": "class Solution {\\npublic:\\n    vector<int> twoSum(vector<int>& nums, int target) {\\n        unordered_map<int, int> seen;\\n        for (int i = 0; i < nums.size(); ++i) {\\n            int diff = target - nums[i];\\n            if (seen.find(diff) != seen.end()) return {seen[diff], i};\\n            seen[nums[i]] = i;\\n        }\\n        return {};\\n    }\\n};"
}

CRITICAL RULES:
1. ONLY C++17 compatible code. Include proper parameter types in functionSpec: "int", "long long", "double", "string", "bool", "vector<int>", "vector<string>", "vector<vector<int>>".
2. starterCode MUST be a clean template with the exact signature.
3. referenceSolution MUST be a 100% working, optimal, bug-free C++ solution that compiles cleanly with g++ and passes EVERY visible and hidden test case.
4. visibleTests: At least 3 clear examples.
5. hiddenTests: At least 5-10 boundary and edge test cases (e.g., single elements, min/max values, duplicates, empty cases if permitted).
6. Inputs in test cases MUST be a JSON object whose keys exactly match the parameter names in functionSpec.
`;

// Deterministic fallback generator for offline / unkeyed testing
function getFallbackProblem(prompt, difficulty = 'Medium', topic = 'General DSA') {
  const promptLower = (prompt || '').toLowerCase();
  
  if (promptLower.includes('palindrome') || promptLower.includes('string')) {
    return {
      title: 'Valid Palindrome After Modification',
      difficulty: difficulty,
      topic: 'Strings & Two Pointers',
      tags: ['String', 'Two Pointers'],
      description: 'Given a string `s`, return `true` if it can be a palindrome after deleting at most one character from it, or `false` otherwise.',
      constraints: ['1 <= s.length <= 10^5', 's consists of lowercase English letters.'],
      examples: [
        {
          inputDisplay: 's = "aba"',
          outputDisplay: 'true',
          explanation: '"aba" is already a palindrome.',
        },
        {
          inputDisplay: 's = "abca"',
          outputDisplay: 'true',
          explanation: 'You could delete the character \'c\'.',
        },
        {
          inputDisplay: 's = "abc"',
          outputDisplay: 'false',
          explanation: 'Deleting any single character cannot make it a palindrome.',
        },
      ],
      functionSpec: {
        name: 'validPalindrome',
        returnType: 'bool',
        parameters: [{ name: 's', type: 'string' }],
      },
      starterCode: 'class Solution {\npublic:\n    bool validPalindrome(string s) {\n        \n    }\n};',
      supportCode: '',
      visibleTests: [
        { id: 'case-1', input: { s: 'aba' }, expectedOutput: true },
        { id: 'case-2', input: { s: 'abca' }, expectedOutput: true },
        { id: 'case-3', input: { s: 'abc' }, expectedOutput: false },
      ],
      hiddenTests: [
        { id: 'hidden-1', input: { s: 'a' }, expectedOutput: true },
        { id: 'hidden-2', input: { s: 'ab' }, expectedOutput: true },
        { id: 'hidden-3', input: { s: 'deeee' }, expectedOutput: true },
        { id: 'hidden-4', input: { s: 'racecar' }, expectedOutput: true },
        { id: 'hidden-5', input: { s: 'abcdef' }, expectedOutput: false },
      ],
      referenceSolution: `class Solution {
public:
    bool isPalindromeRange(const string& s, int i, int j) {
        while (i < j) {
            if (s[i] != s[j]) return false;
            i++;
            j--;
        }
        return true;
    }

    bool validPalindrome(string s) {
        int i = 0, j = s.size() - 1;
        while (i < j) {
            if (s[i] != s[j]) {
                return isPalindromeRange(s, i + 1, j) || isPalindromeRange(s, i, j - 1);
            }
            i++;
            j--;
        }
        return true;
    }
};`,
    };
  }

  // Default: Subarray Sum / Target problem
  return {
    title: 'Subarray Sum Equals Target',
    difficulty: difficulty,
    topic: topic || 'Array & Hash Table',
    tags: ['Array', 'Hash Table', 'Prefix Sum'],
    description: 'Given an array of integers `nums` and an integer `k`, return the total number of continuous subarrays whose sum equals to `k`.',
    constraints: [
      '1 <= nums.length <= 2 * 10^4',
      '-1000 <= nums[i] <= 1000',
      '-10^7 <= k <= 10^7',
    ],
    examples: [
      {
        inputDisplay: 'nums = [1, 1, 1], k = 2',
        outputDisplay: '2',
        explanation: 'Subarrays [1, 1] at indices 0..1 and 1..2 sum up to 2.',
      },
      {
        inputDisplay: 'nums = [1, 2, 3], k = 3',
        outputDisplay: '2',
        explanation: 'Subarrays [1, 2] and [3] sum up to 3.',
      },
    ],
    functionSpec: {
      name: 'subarraySum',
      returnType: 'int',
      parameters: [
        { name: 'nums', type: 'vector<int>' },
        { name: 'k', type: 'int' },
      ],
    },
    starterCode: 'class Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        \n    }\n};',
    supportCode: '',
    visibleTests: [
      { id: 'case-1', input: { nums: [1, 1, 1], k: 2 }, expectedOutput: 2 },
      { id: 'case-2', input: { nums: [1, 2, 3], k: 3 }, expectedOutput: 2 },
      { id: 'case-3', input: { nums: [1, -1, 0], k: 0 }, expectedOutput: 3 },
    ],
    hiddenTests: [
      { id: 'hidden-1', input: { nums: [3], k: 3 }, expectedOutput: 1 },
      { id: 'hidden-2', input: { nums: [3], k: 2 }, expectedOutput: 0 },
      { id: 'hidden-3', input: { nums: [1, 2, 1, 2, 1], k: 3 }, expectedOutput: 4 },
      { id: 'hidden-4', input: { nums: [-1, -1, 1], k: 0 }, expectedOutput: 1 },
      { id: 'hidden-5', input: { nums: [0, 0, 0], k: 0 }, expectedOutput: 6 },
    ],
    referenceSolution: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> prefixSumCount;
        prefixSumCount[0] = 1;
        int currentSum = 0;
        int count = 0;

        for (int num : nums) {
            currentSum += num;
            if (prefixSumCount.find(currentSum - k) != prefixSumCount.end()) {
                count += prefixSumCount[currentSum - k];
            }
            prefixSumCount[currentSum]++;
        }
        return count;
    }
};`,
  };
}

/**
 * Invokes Gemini AI or fallback generator to generate a raw problem payload
 */
async function generateRawProblem({ prompt, difficulty = 'Medium', topic = 'General DSA', feedback = '' }) {
  const apiKey = process.env.AI_API_KEY;
  const isMock = !apiKey || apiKey === 'mock_key_for_now' || apiKey.trim() === '';

  if (isMock) {
    console.log('[AI Provider] Using high-fidelity algorithmic fallback generator (AI_API_KEY is mock).');
    return getFallbackProblem(prompt, difficulty, topic);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    let userInstruction = `Generate a DSA coding challenge with difficulty "${difficulty}".
Topic / Instructions: "${prompt}".
Target topic category: "${topic}".`;

    if (feedback) {
      userInstruction += `\n\nPREVIOUS GENERATION ATTEMPT FAILED WITH ERROR:
${feedback}
Please fix the code and test cases so the reference solution compiles and passes 100% of all tests.`;
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userInstruction}` }] }],
      generationConfig: {
        temperature: 0.2, // Low temperature for high precision code & test consistency
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    const cleanedJson = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.warn(`[AI Provider] Gemini API request failed (${error.message}). Falling back to algorithmic generator.`);
    return getFallbackProblem(prompt, difficulty, topic);
  }
}

module.exports = {
  generateRawProblem,
  getFallbackProblem,
};
