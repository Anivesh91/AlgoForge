export const MOCK_PROBLEM = {
  _id: 'mock-problem-subarray-sum',
  title: 'Maximum Subarray Sum',
  slug: 'maximum-subarray-sum',
  difficulty: 'Medium',
  topic: 'Dynamic Programming / Arrays',
  tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
  userPrompt: 'Give me a medium array problem involving continuous segments.',
  description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.\n\nA **subarray** is a contiguous non-empty sequence of elements within an array.`,
  constraints: [
    '1 <= nums.length <= 10^5',
    '-10^4 <= nums[i] <= 10^4',
  ],
  examples: [
    {
      inputDisplay: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
      outputDisplay: '6',
      explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
    },
    {
      inputDisplay: 'nums = [1]',
      outputDisplay: '1',
      explanation: 'The subarray [1] has the largest sum 1.',
    },
    {
      inputDisplay: 'nums = [5,4,-1,7,8]',
      outputDisplay: '23',
      explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.',
    },
  ],
  functionSpec: {
    name: 'maxSubArray',
    returnType: 'int',
    parameters: [{ name: 'nums', type: 'vector<int>&' }],
  },
  starterCode: `#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your solution here
        
    }
};`,
  visibleTests: [
    {
      id: 'case-1',
      input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
      expectedOutput: 6,
    },
    {
      id: 'case-2',
      input: { nums: [1] },
      expectedOutput: 1,
    },
    {
      id: 'case-3',
      input: { nums: [5, 4, -1, 7, 8] },
      expectedOutput: 23,
    },
  ],
  isSaved: false,
  status: 'READY',
};
