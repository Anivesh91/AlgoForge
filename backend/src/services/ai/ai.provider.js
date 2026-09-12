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

  // 1. LRU Cache Predefined Challenge
  if (promptLower.includes('lru') || promptLower.includes('cache')) {
    return {
      title: 'LRU Cache Design and Operations',
      difficulty: difficulty,
      topic: 'Design & Linked List',
      tags: ['Design', 'Hash Table', 'Linked List'],
      description: 'Implement a simulation of a Least Recently Used (LRU) cache with a given `capacity`.\n\nYou are given an array of string operations `operations` containing `"put"` and `"get"`, and a 2D integer array `arguments` where:\n- For `"put"`: `arguments[i] = [key, value]`\n- For `"get"`: `arguments[i] = [key]`\n\nReturn an array of integers representing the results of all `"get"` operations in the order they occurred. If a key is not found in `"get"`, return `-1`.',
      constraints: [
        '1 <= capacity <= 1000',
        '1 <= operations.length <= 10^4',
        'arguments[i].length == 1 or 2',
        '0 <= key, value <= 10^5',
      ],
      examples: [
        {
          inputDisplay: 'capacity = 2, operations = ["put", "put", "get", "put", "get", "get"], arguments = [[1, 1], [2, 2], [1], [3, 3], [2], [3]]',
          outputDisplay: '[1, -1, 3]',
          explanation: 'get(1) returns 1. put(3, 3) evicts key 2 (least recently used). get(2) returns -1. get(3) returns 3.',
        },
      ],
      functionSpec: {
        name: 'simulateLRU',
        returnType: 'vector<int>',
        parameters: [
          { name: 'capacity', type: 'int' },
          { name: 'operations', type: 'vector<string>' },
          { name: 'arguments', type: 'vector<vector<int>>' },
        ],
      },
      starterCode: 'class Solution {\npublic:\n    vector<int> simulateLRU(int capacity, vector<string>& operations, vector<vector<int>>& arguments) {\n        \n    }\n};',
      supportCode: '',
      visibleTests: [
        {
          id: 'case-1',
          input: {
            capacity: 2,
            operations: ['put', 'put', 'get', 'put', 'get', 'get'],
            arguments: [[1, 1], [2, 2], [1], [3, 3], [2], [3]],
          },
          expectedOutput: [1, -1, 3],
        },
        {
          id: 'case-2',
          input: {
            capacity: 1,
            operations: ['put', 'get', 'put', 'get'],
            arguments: [[2, 10], [2], [3, 20], [2]],
          },
          expectedOutput: [10, -1],
        },
        {
          id: 'case-3',
          input: {
            capacity: 2,
            operations: ['get', 'put', 'get'],
            arguments: [[5], [5, 50], [5]],
          },
          expectedOutput: [-1, 50],
        },
      ],
      hiddenTests: [
        {
          id: 'hidden-1',
          input: {
            capacity: 3,
            operations: ['put', 'put', 'put', 'get', 'get', 'get'],
            arguments: [[1, 10], [2, 20], [3, 30], [1], [2], [3]],
          },
          expectedOutput: [10, 20, 30],
        },
        {
          id: 'hidden-2',
          input: {
            capacity: 2,
            operations: ['put', 'put', 'put', 'get'],
            arguments: [[1, 1], [2, 2], [1, 10], [1]],
          },
          expectedOutput: [10],
        },
      ],
      referenceSolution: `class Solution {
public:
    vector<int> simulateLRU(int capacity, vector<string>& operations, vector<vector<int>>& arguments) {
        vector<int> results;
        list<pair<int, int>> dll;
        unordered_map<int, list<pair<int, int>>::iterator> cache;

        for (size_t i = 0; i < operations.size(); ++i) {
            const string& op = operations[i];
            if (op == "get") {
                int key = arguments[i][0];
                if (cache.find(key) == cache.end()) {
                    results.push_back(-1);
                } else {
                    int val = cache[key]->second;
                    dll.erase(cache[key]);
                    dll.push_front({key, val});
                    cache[key] = dll.begin();
                    results.push_back(val);
                }
            } else if (op == "put") {
                int key = arguments[i][0];
                int val = arguments[i][1];
                if (cache.find(key) != cache.end()) {
                    dll.erase(cache[key]);
                } else if ((int)dll.size() >= capacity) {
                    int lruKey = dll.back().first;
                    dll.pop_back();
                    cache.erase(lruKey);
                }
                dll.push_front({key, val});
                cache[key] = dll.begin();
            }
        }
        return results;
    }
};`,
    };
  }

  // 2. Container With Most Water Predefined Challenge
  if (promptLower.includes('water') || promptLower.includes('container') || promptLower.includes('area')) {
    return {
      title: 'Container With Most Water',
      difficulty: difficulty,
      topic: 'Array & Two Pointers',
      tags: ['Array', 'Two Pointers', 'Greedy'],
      description: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.\n\nNotice that you may not slant the container.',
      constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
      examples: [
        {
          inputDisplay: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]',
          outputDisplay: '49',
          explanation: 'The vertical lines at indices 1 and 8 form a container of width 7 and height min(8, 7) = 7, giving 7 * 7 = 49.',
        },
        {
          inputDisplay: 'height = [1, 1]',
          outputDisplay: '1',
          explanation: 'The width is 1 and the height is 1, so the max area is 1.',
        },
      ],
      functionSpec: {
        name: 'maxArea',
        returnType: 'int',
        parameters: [
          { name: 'height', type: 'vector<int>' },
        ],
      },
      starterCode: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        \n    }\n};',
      supportCode: '',
      visibleTests: [
        { id: 'case-1', input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expectedOutput: 49 },
        { id: 'case-2', input: { height: [1, 1] }, expectedOutput: 1 },
        { id: 'case-3', input: { height: [4, 3, 2, 1, 4] }, expectedOutput: 16 },
      ],
      hiddenTests: [
        { id: 'hidden-1', input: { height: [1, 2, 1] }, expectedOutput: 2 },
        { id: 'hidden-2', input: { height: [2, 3, 4, 5, 18, 17, 6] }, expectedOutput: 17 },
      ],
      referenceSolution: `class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = (int)height.size() - 1;
        int maxWater = 0;
        while (left < right) {
            int h = min(height[left], height[right]);
            maxWater = max(maxWater, h * (right - left));
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return maxWater;
    }
};`,
    };
  }
  
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
