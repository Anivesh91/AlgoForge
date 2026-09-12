# AlgoForge Blueprint Summary

This document captures the locked core rules and architecture from the AlgoForge Master Project Blueprint (V1).

## 1. Locked Decisions
- **Language**: C++ only.
- **Frontend**: React + Vite + Tailwind CSS + Monaco Editor (`@monaco-editor/react`).
- **Backend**: Node.js + Express.
- **Database**: MongoDB + Mongoose.
- **Validation**: Zod (all request bodies and LLM structured outputs).
- **Authentication**: JWT stored in HTTP-only cookie.
- **Execution**: Isolated Docker container (`g++ -std=c++17`). **User code must NEVER execute directly in the Express process.**
- **Source of Truth Rule**: Real compiler/judge determines test passes, NOT the LLM.

## 2. API Response Envelope
- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": { "code": string, "message": string, "details"?: any } }`

## 3. Privacy & Security Rule
- `hiddenTests` and `referenceSolution` must **never** be sent to the frontend/browser client.
