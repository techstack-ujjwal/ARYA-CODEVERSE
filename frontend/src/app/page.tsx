"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  GitBranch,
  Terminal,
  Activity,
  Award,
  Layers,
  Sparkles,
  Search,
  FileText,
  Code2,
  Lock,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const [activeStage, setActiveStage] = useState<"idea" | "ppt" | "product">("idea");

  const stagesData = {
    idea: {
      title: "Stage 1: Idea & Feasibility",
      weight: "20% Weight",
      description:
        "Evaluates problem clarity, uniqueness, target audience, and realistic buildability with real-time web search market grounding.",
      agents: [
        { name: "Idea Selection Agent", desc: "Uniqueness & problem verification" },
        { name: "Problem & Impact Agent", desc: "Clarity of value prop & target users" },
        { name: "Feasibility Agent", desc: "Buildability within hackathon timeline" },
        { name: "Market & Gap Agent", desc: "Live competitor search via Tavily" },
      ],
      tools: ["Tavily Web Search", "Pydantic Schema Validation"],
    },
    ppt: {
      title: "Stage 2: Technical Architecture & Deck",
      weight: "25% Weight",
      description:
        "Lightweight PDF parsing extracts system architecture claims, business models, and scalability statements into verifiable assertions.",
      agents: [
        { name: "Presentation Agent", desc: "Narrative structure & clarity" },
        { name: "Technical Architecture Agent", desc: "Claim extraction (stack, APIs, DB)" },
        { name: "Business Impact Agent", desc: "Market model & scalability story" },
      ],
      tools: ["PyPDF Text/Slide Parser", "Claim Extraction Engine"],
    },
    product: {
      title: "Stage 3: Product, Security & Uptime",
      weight: "55% Weight",
      description:
        "Deterministic tools run live uptime health checks, static code analysis, and security scans before AI synthesis.",
      agents: [
        { name: "Code Quality Agent", desc: "Radon cyclomatic & maintainability" },
        { name: "UI/UX & Design Agent", desc: "Responsiveness, styling & a11y" },
        { name: "Functionality Agent", desc: "Deterministic flow & smoke check" },
        { name: "Security Hygiene Agent", desc: "Bandit / Semgrep vulnerability scan" },
        { name: "Real-World Impact Agent", desc: "Practical applicability & adoption" },
      ],
      tools: ["Uptime Checker", "Static Code Analyzer", "Security Hygiene Scanner"],
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-zinc-800/80 bg-grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-950 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI-Powered Multi-Agent Evaluation Engine v2.0</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 max-w-3xl mx-auto leading-[1.1]">
            Evidence-Grounded{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600">
              Hackathon Judging.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate subjective scoring. 17 specialized AI agents paired with deterministic tools verify participant claims against live code, architecture slides, and deployed applications.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/dashboard">
              <Button size="lg" className="px-6 gap-2">
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/leaderboard">
              <Button variant="secondary" size="lg" className="px-6 gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>View Leaderboard</span>
              </Button>
            </Link>
          </div>

          {/* Philosophy Banner */}
          <div className="mt-16 pt-8 border-t border-zinc-800/60 flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono text-xs text-zinc-400">
            <span className="text-zinc-200 font-semibold">Claim</span>
            <span className="text-zinc-600">→</span>
            <span className="text-zinc-200 font-semibold">Evidence</span>
            <span className="text-zinc-600">→</span>
            <span className="text-zinc-200 font-semibold">Verification</span>
            <span className="text-zinc-600">→</span>
            <span className="text-zinc-200 font-semibold">Score</span>
            <span className="text-zinc-600">→</span>
            <span className="text-emerald-400 font-semibold">Actionable Fixes</span>
          </div>
        </div>
      </section>

      {/* Interactive 3-Stage Pipeline Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Three-Stage Evaluation Pipeline
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mt-1">
              Multi-Agent Orchestration
            </h2>
          </div>

          {/* Stage Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            {(["idea", "ppt", "product"] as const).map((stageKey) => (
              <button
                key={stageKey}
                onClick={() => setActiveStage(stageKey)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${
                  activeStage === stageKey
                    ? "bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                {stageKey} Stage
              </button>
            ))}
          </div>
        </div>

        {/* Active Stage Card */}
        <Card variant="elevated" className="border-zinc-800 bg-zinc-950/80">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="purple" size="md">
                  {stagesData[activeStage].weight}
                </Badge>
                <h3 className="text-lg font-bold text-zinc-100">
                  {stagesData[activeStage].title}
                </h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {stagesData[activeStage].description}
              </p>

              <div className="pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2 font-semibold">
                  Underlying Deterministic Tools:
                </div>
                <div className="flex flex-wrap gap-2">
                  {stagesData[activeStage].tools.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5"
                    >
                      <Terminal className="w-3 h-3 text-zinc-500" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-96 space-y-2.5">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                Active Agents in this Stage:
              </div>
              {stagesData[activeStage].agents.map((agent, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    0{i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {agent.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {agent.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Designed for Hackathon Rigor
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Combining automated tool execution with human judge calibration for bulletproof results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable className="space-y-3 bg-zinc-900/40">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Instant Participant Feedback
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Participants get private, non-judged diagnostic reports on 8 dimensions within 90 seconds of submitting their repo and live link.
              </p>
            </Card>

            <Card hoverable className="space-y-3 bg-zinc-900/40">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Cross-Stage Consistency
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Verifies that features and technologies promised in the Stage 2 presentation deck actually exist in the deployed codebase.
              </p>
            </Card>

            <Card hoverable className="space-y-3 bg-zinc-900/40">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">
                70% AI + 30% Human Formula
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Empowers human judges with complete evidence dossiers, while standardizing baseline evaluations mathematically.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
