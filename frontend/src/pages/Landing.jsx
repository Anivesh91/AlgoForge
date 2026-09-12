import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Terminal, ShieldCheck, Zap, ArrowRight, FileCode2, Cpu } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered C++ Coding Practice
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Imagine a coding problem. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Turn it into a challenge.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Describe any algorithmic idea or attach an assignment. AlgoForge generates a verified C++ problem with starter code, hidden test suites, and safe Docker sandbox execution.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/workspace"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 group"
          >
            Start Practicing
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 font-semibold text-base border border-dark-600 transition"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-4 bg-dark-900/60 border-y border-dark-600">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
            The AlgoForge Product Loop
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-dark-800/80 p-6 rounded-xl border border-dark-600 flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">Describe</h3>
              <p className="text-sm text-gray-400">
                Explain your desired problem concept, pattern, or attach an image/PDF reference.
              </p>
            </div>

            <div className="bg-dark-800/80 p-6 rounded-xl border border-dark-600 flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">Generate</h3>
              <p className="text-sm text-gray-400">
                AI generates statement, starter function, edge cases, and verifies its own reference solution.
              </p>
            </div>

            <div className="bg-dark-800/80 p-6 rounded-xl border border-dark-600 flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">Code</h3>
              <p className="text-sm text-gray-400">
                Write clean C++ code in Monaco Editor with automatic drafts and instant diagnostics.
              </p>
            </div>

            <div className="bg-dark-800/80 p-6 rounded-xl border border-dark-600 flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold text-lg text-white mb-2">Judge & Learn</h3>
              <p className="text-sm text-gray-400">
                Run against visible tests or submit against hidden tests inside our hardened Docker sandbox.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-dark-800/40 border border-dark-600">
            <FileCode2 className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">On-Demand DSA Challenges</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              No static question catalogs. Generate custom problems tailored to the exact pattern, data structure, or difficulty you need to practice.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-800/40 border border-dark-600">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Real Compiler Sandbox</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Real <code>g++ -std=c++17</code> compiler inside isolated Docker containers. Reliable AC, WA, CE, RE, and TLE status mapping.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-800/40 border border-dark-600">
            <Cpu className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Progressive AI Guidance</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Learning mode offers progressive hints and conceptual nudges without leaking complete solutions or hidden test inputs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
