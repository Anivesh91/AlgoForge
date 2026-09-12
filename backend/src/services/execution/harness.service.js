/**
 * AlgoForge C++ Test Harness Service
 * Generates an invisible test harness that combines support structs, user's Solution class,
 * test data instantiation, invocation, output comparison, and JSON serialization.
 */

// Helper to convert JS values into C++ literal declarations
function toCppLiteral(val, type) {
  const normalizedType = type.replace(/&/g, '').replace(/const /g, '').trim();

  if (val === null || val === undefined) {
    return '0';
  }

  switch (normalizedType) {
    case 'int':
      return `${parseInt(val, 10)}`;

    case 'long long':
      return `${val}LL`;

    case 'bool':
      return val ? 'true' : 'false';

    case 'string':
      return JSON.stringify(String(val));

    case 'vector<int>':
      if (!Array.isArray(val)) return '{}';
      return `{${val.map((x) => parseInt(x, 10)).join(', ')}}`;

    case 'vector<long long>':
      if (!Array.isArray(val)) return '{}';
      return `{${val.map((x) => `${x}LL`).join(', ')}}`;

    case 'vector<string>':
      if (!Array.isArray(val)) return '{}';
      return `{${val.map((s) => JSON.stringify(String(s))).join(', ')}}`;

    case 'vector<vector<int>>':
      if (!Array.isArray(val)) return '{}';
      return `{${val.map((row) => `{${row.join(', ')}}`).join(', ')}}`;

    default:
      // Fallback
      if (Array.isArray(val)) {
        return `{${val.map((v) => toCppLiteral(v, 'int')).join(', ')}}`;
      }
      return String(val);
  }
}

/**
 * Standard C++ headers and JSON serialization printers included in the harness
 */
const HARNESS_UTILITIES = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
#include <chrono>
#include <cmath>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <deque>
#include <numeric>
#include <climits>

using namespace std;

// Serialization helper functions for converting C++ values to JSON
template <typename T>
void printValue(const T& val) {
    cout << val;
}

template <>
void printValue<bool>(const bool& val) {
    cout << (val ? "true" : "false");
}

template <>
void printValue<string>(const string& val) {
    cout << "\\"";
    for (char c : val) {
        if (c == '\\"') cout << "\\\\\\\"";
        else if (c == '\\\\') cout << "\\\\\\\\";
        else if (c == '\\n') cout << "\\\\n";
        else if (c == '\\r') cout << "\\\\r";
        else if (c == '\\t') cout << "\\\\t";
        else cout << c;
    }
    cout << "\\"";
}

template <typename T>
void printValue(const vector<T>& vec) {
    cout << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        printValue(vec[i]);
        if (i + 1 < vec.size()) cout << ", ";
    }
    cout << "]";
}

template <typename T>
void printValue(const vector<vector<T>>& mat) {
    cout << "[";
    for (size_t i = 0; i < mat.size(); ++i) {
        printValue(mat[i]);
        if (i + 1 < mat.size()) cout << ", ";
    }
    cout << "]";
}
`;

/**
 * Generates the complete compilable C++ code including user code and the test harness main()
 */
function generateHarnessCode(userCode, functionSpec, tests, supportCode = '') {
  const { name: funcName, returnType, parameters } = functionSpec;

  let testCasesCode = '';

  tests.forEach((test, idx) => {
    const testId = test.id || `case-${idx + 1}`;
    const testExpectedLiteral = toCppLiteral(test.expectedOutput, returnType);

    // Build parameter declarations
    const paramInits = parameters
      .map((p) => {
        const val = typeof test.input === 'object' && test.input !== null && p.name in test.input
          ? test.input[p.name]
          : (Array.isArray(test.input) ? test.input[parameters.indexOf(p)] : test.input);
        
        const rawType = p.type.replace(/&/g, '').replace(/const /g, '').trim();
        const literal = toCppLiteral(val, rawType);
        return `        ${rawType} arg_${p.name} = ${literal};`;
      })
      .join('\n');

    const funcCallArgs = parameters.map((p) => `arg_${p.name}`).join(', ');

    testCasesCode += `
    {
        // Test Case ${idx + 1} (${testId})
${paramInits}
        ${returnType.replace(/&/g, '').trim()} expected = ${testExpectedLiteral};
        
        Solution solution_instance;
        auto start_time = chrono::high_resolution_clock::now();
        auto actual = solution_instance.${funcName}(${funcCallArgs});
        auto end_time = chrono::high_resolution_clock::now();
        double elapsed_ms = chrono::duration<double, milli>(end_time - start_time).count();

        bool passed = (actual == expected);

        cout << "__ALGOFORGE_CASE_START__" << endl;
        cout << "{\\"id\\": \\"${testId}\\", \\"passed\\": " << (passed ? "true" : "false")
             << ", \\"runtimeMs\\": " << elapsed_ms
             << ", \\"actualOutput\\": ";
        printValue(actual);
        cout << ", \\"expectedOutput\\": ";
        printValue(expected);
        cout << "}" << endl;
        cout << "__ALGOFORGE_CASE_END__" << endl;
    }
`;
  });

  return `
// ==================== AlgoForge System Utilities ====================
${HARNESS_UTILITIES}

// ==================== Supporting Data Structures ====================
${supportCode || '// No additional structs required'}

// ==================== User Solution ====================
${userCode}

// ==================== Invisible Test Harness ====================
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cout << "__ALGOFORGE_EXECUTION_START__" << endl;
${testCasesCode}
    cout << "__ALGOFORGE_EXECUTION_END__" << endl;

    return 0;
}
`;
}

module.exports = {
  toCppLiteral,
  generateHarnessCode,
};
