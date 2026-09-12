# AlgoForge

AlgoForge is an AI-powered C++ coding practice platform. A user describes a coding problem or attaches a reference, and the system generates a validated LeetCode-style problem package:
- Problem statement & constraints
- Exactly one target C++ starter function
- Hidden and visible test suites
- Reference solution executed and verified before presenting to the user
- In-browser Monaco editor for solving
- Safe execution inside an isolated Docker C++ sandbox (`g++`)
- AI-guided progressive hints and debugging support

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), React Router, Axios
- **Backend**: Node.js, Express, Mongoose, Zod, JWT (HTTP-only cookie), Multer
- **Database**: MongoDB
- **Execution Sandbox**: Docker (`g++ -std=c++17`), restricted privileges, no network, resource caps
- **AI Orchestration**: Multimodal LLM provider abstraction with Zod schema validation

---

## 📁 Repository Structure

```
algoforge/
├── docs/                 # Blueprint & architecture documentation
├── frontend/             # React + Vite + Tailwind SPA
│   ├── src/
│   │   ├── components/   # Common and workspace components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API services
│   │   ├── context/      # Auth & Workspace state contexts
│   │   └── hooks/        # Custom React hooks
│   └── package.json
└── backend/              # Node.js + Express API
    ├── runner/           # Docker execution sandbox & Dockerfile
    ├── src/
    │   ├── config/       # Database & environment configuration
    │   ├── controllers/  # HTTP request controllers
    │   ├── middleware/   # Auth, error, rate-limiting middleware
    │   ├── models/       # Mongoose models (User, Problem, Submission, Conversation)
    │   ├── routes/       # Express route handlers
    │   ├── services/     # Core domain logic (AI, Docker judge, harness)
    │   └── validators/   # Zod validation schemas
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Docker Desktop (for C++ code runner)
- MongoDB instance (Local or Atlas)

### Setup & Run
1. Backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```
2. Frontend:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
