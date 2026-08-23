"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  GitBranch,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Trophy,
  Award,
  Search,
  Cpu,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardSlot, CardBadge } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const [activeStage, setActiveStage] = useState<"idea" | "ppt" | "product">("idea");

  const stagesData = {
    idea: {
      title: "Stage 1: Idea & Feasibility",
      weight: "20% Weight",
      description:
        "4 specialized agents analyze problem severity, technical buildability, novelty, and market uniqueness grounded by live Tavily web search.",
      agents: [
        { name: "Idea Selection Agent", desc: "Assesses foundational uniqueness & moat." },
        { name: "Problem Impact Agent", desc: "Measures problem severity & economic impact." },
        { name: "Feasibility Agent", desc: "Validates architecture feasibility & buildability." },
        { name: "Market Landscape Agent", desc: "Live Tavily search across existing competitors." },
      ],
      tools: ["Tavily Web Search API", "Semantic Similarity Index"],
    },
    ppt: {
      title: "Stage 2: Technical Architecture & Deck",
      weight: "25% Weight",
      description:
        "3 agents inspect PDF pitch & architecture slides, extracting technical stack and API claims for downstream cross-stage verification.",
      agents: [
        { name: "Technical Architecture Agent", desc: "Maps microservices & architectural claims." },
        { name: "Presentation Coherence Agent", desc: "Checks slide density, narrative & flow." },
        { name: "Business Model Agent", desc: "Evaluates scalability & monetization model." },
      ],
      tools: ["PDF Text & OCR Parser", "Claim Extraction Engine"],
    },
    product: {
      title: "Stage 3: Repository & Live Deployment",
      weight: "55% Weight",
      description:
        "5 agents evaluate live deployed applications and GitHub source code with deterministic tool scanners and AST analysis.",
      agents: [
        { name: "UI/UX Experience Agent", desc: "Audits frontend reachability & UX polish." },
        { name: "Functionality Agent", desc: "Tests core workflows & error boundaries." },
        { name: "Code Quality Agent", desc: "AST inspection & cyclomatic complexity check." },
        { name: "Security Agent", desc: "Scans for secrets, API leaks, & OWASP Top 10." },
        { name: "Real-World Impact Agent", desc: "Measures production readiness & utility." },
      ],
      tools: ["Live Uptime Check", "Radon Code Analyzer", "Bandit Security Scanner"],
    },
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-black text-white">
      {/* Ambient Lighting Layer */}
      <div className="ambient-glow" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 border-b border-zinc-800 bg-grid-pattern z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono mb-8 shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span>JuryX Autonomous Multi-Agent Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            Evidence-Grounded{" "}
            <span className="text-emerald-400">
              Hackathon Judging.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate subjective scoring and reviewer fatigue. 17 specialized AI agents paired with deterministic verification tools validate student claims against live code, architecture decks, and deployed applications.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="glow" size="lg" className="px-7 gap-2 text-sm shadow-xl">
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/leaderboard">
              <Button variant="secondary" size="lg" className="px-6 gap-2 text-sm">
                <Award className="w-4 h-4 text-zinc-300" />
                <span>View Leaderboard</span>
              </Button>
            </Link>
          </div>

          {/* Grounding Verification Sequence */}
          <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono text-xs text-zinc-400">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold">Claim</span>
            <span className="text-zinc-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold">Evidence Extraction</span>
            <span className="text-zinc-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold">Deterministic Verification</span>
            <span className="text-zinc-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-semibold">70/30 Composite Score</span>
            <span className="text-zinc-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-semibold">Actionable Fixes</span>
          </div>
        </div>
      </section>

      {/* Interactive 3-Stage Pipeline Section */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 w-full z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Three-Stage Orchestration Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Multi-Agent Evaluation Swarm
            </h2>
          </div>

          {/* Stage Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl backdrop-blur-md">
            {(["idea", "ppt", "product"] as const).map((stageKey) => (
              <button
                key={stageKey}
                onClick={() => setActiveStage(stageKey)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all capitalize cursor-pointer ${
                  activeStage === stageKey
                    ? "bg-zinc-800 text-white font-bold border border-zinc-700 shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                {stageKey} Stage
              </button>
            ))}
          </div>
        </div>

        {/* Active Stage Card Slot */}
        <Card variant="elevated" className="border-zinc-800 bg-zinc-950 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" size="md">
                  {stagesData[activeStage].weight}
                </Badge>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {stagesData[activeStage].title}
                </h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {stagesData[activeStage].description}
              </p>

              {/* Deterministic Tools Slot */}
              <CardSlot variant="muted" className="mt-4 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Underlying Deterministic Scanners & Tools:
                </div>
                <div className="flex flex-wrap gap-2">
                  {stagesData[activeStage].tools.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 flex items-center gap-1.5 shadow-sm"
                    >
                      <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                      {t}
                    </span>
                  ))}
                </div>
              </CardSlot>
            </div>

            {/* Active Agents Column */}
            <div className="w-full lg:w-96 space-y-2.5">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                Active Agents in this Stage:
              </div>
              {stagesData[activeStage].agents.map((agent, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm"
                >
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    0{i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">
                      {agent.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
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
      <section className="py-20 border-t border-zinc-800 bg-black z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Engineered for Hackathon Rigor
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Combining automated tool execution with human judge calibration for bulletproof, verifiable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" hoverable className="space-y-3.5 p-6 bg-zinc-900/40 border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Instant Participant Feedback
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Participants receive private, non-judged diagnostic reports across 8 dimensions within 90 seconds of submitting their repo and live link.
              </p>
            </Card>

            <Card variant="glass" hoverable className="space-y-3.5 p-6 bg-zinc-900/40 border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Cross-Stage Consistency
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Verifies that technologies and architecture promised in the Stage 2 presentation deck actually exist in the deployed codebase.
              </p>
            </Card>

            <Card variant="glass" hoverable className="space-y-3.5 p-6 bg-zinc-900/40 border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center shadow-sm">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
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
