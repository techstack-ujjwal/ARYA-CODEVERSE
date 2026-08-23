"use client";

import React, { useState, useMemo } from "react";
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
  AlertTriangle,
  Play,
  Sliders,
  Check,
  ChevronRight,
  ChevronDown,
  Globe,
  FileText,
  Lock,
  Code2,
  RefreshCw,
  Eye,
  BarChart3,
  Users,
  Compass,
  FileCode2,
  Wand2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardSlot, CardBadge } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/store/auth-context";

// Sample Pre-set Claims for the Live Interactive Workbench
interface ClaimScenario {
  id: string;
  title: string;
  stage: "Stage 1: Idea (20%)" | "Stage 2: PPT (25%)" | "Stage 3: Code & Security (55%)";
  claimText: string;
  tool: string;
  toolCategory: "Radon AST" | "Bandit OWASP" | "Tavily Web Search" | "Slide OCR";
  latency: string;
  confidence: number;
  badgeBg: string;
  badgeText: string;
  proof: string;
  finding: string;
  status: "deterministic_pass" | "calibrated_warning";
}

const CLAIM_SCENARIOS: ClaimScenario[] = [
  {
    id: "ast-cyclomatic",
    title: "Modular AST & Cyclomatic Complexity < 6",
    stage: "Stage 3: Code & Security (55%)",
    claimText:
      "All backend FastAPI endpoints maintain cyclomatic complexity < 6 with zero blocking I/O and strict error boundaries.",
    tool: "Radon AST Analyzer + Tree-sitter",
    toolCategory: "Radon AST",
    latency: "0.84s",
    confidence: 97.8,
    badgeBg: "bg-[#D8EAD9]",
    badgeText: "text-[#2D5A36]",
    proof: "AST cyclomatic mean: 3.2 (Max: 5 in auth_router) • Zero blocking calls detected",
    finding:
      "24 Python modules analyzed. Strict separation of concerns verified across SQLAlchemy async models and Celery tasks.",
    status: "deterministic_pass",
  },
  {
    id: "owasp-secrets",
    title: "Zero Plaintext Secrets & OWASP Top 10 Hygiene",
    stage: "Stage 3: Code & Security (55%)",
    claimText:
      "Codebase implements parameterized SQL queries, CORS domain whitelisting, and zero hardcoded JWT or database tokens.",
    tool: "Bandit AST Security Scanner + Semgrep Engine",
    toolCategory: "Bandit OWASP",
    latency: "1.12s",
    confidence: 99.2,
    badgeBg: "bg-[#F5DCD7]",
    badgeText: "text-[#7A3A30]",
    proof: "Bandit Score: 0 High / 0 Medium Issues • Semgrep OWASP: 100% Pass",
    finding:
      "Scanned 14,820 lines of code. Environment variables loaded exclusively via pydantic-settings. High security hygiene confirmed.",
    status: "deterministic_pass",
  },
  {
    id: "novelty-tavily",
    title: "Novel Differential Privacy on LMS Signals",
    stage: "Stage 1: Idea (20%)",
    claimText:
      "Federated learning architecture over student LMS canvas events has no direct open-source or commercial collision.",
    tool: "Tavily Web Search API + Embedding Matrix",
    toolCategory: "Tavily Web Search",
    latency: "1.45s",
    confidence: 93.4,
    badgeBg: "bg-[#DDE4F8]",
    badgeText: "text-[#3A4B86]",
    proof: "Tavily scanned 28 papers & repos • Cosine Similarity: 0.16 (Low collision)",
    finding:
      "High market novelty. Similar federated medical architectures exist, but student mental-health LMS application is 84% unique.",
    status: "deterministic_pass",
  },
];

// All 17 Agents Directory Data
interface AgentDetail {
  id: string;
  name: string;
  stage: "idea" | "ppt" | "product" | "cross";
  stageLabel: string;
  desc: string;
  deterministicTool: string;
  metric: string;
  colorBg: string;
  colorText: string;
}

const ALL_AGENTS: AgentDetail[] = [
  // Stage 1: Idea (4)
  {
    id: "idea_selection",
    name: "Idea Selection & Novelty Agent",
    stage: "idea",
    stageLabel: "Stage 1: Idea (20%)",
    desc: "Assesses foundational uniqueness, technical defensibility, and technological moat against existing open-source repos.",
    deterministicTool: "Tavily Web Search & Vector Embedding Matcher",
    metric: "Novelty Index (0-100)",
    colorBg: "bg-[#DDE4F8]",
    colorText: "text-[#3A4B86]",
  },
  {
    id: "problem_impact",
    name: "Problem Magnitude & Impact Agent",
    stage: "idea",
    stageLabel: "Stage 1: Idea (20%)",
    desc: "Measures problem severity, user persona reach, and quantifiable economic or social impact.",
    deterministicTool: "TAM/SAM Calculator & Impact Parser",
    metric: "Impact Score",
    colorBg: "bg-[#DDE4F8]",
    colorText: "text-[#3A4B86]",
  },
  {
    id: "feasibility",
    name: "Technical Feasibility Agent",
    stage: "idea",
    stageLabel: "Stage 1: Idea (20%)",
    desc: "Evaluates whether proposed architecture and latency targets can realistically be built within hackathon timeframe.",
    deterministicTool: "Dependency & Resource Cost Graph",
    metric: "Buildability Rating",
    colorBg: "bg-[#DDE4F8]",
    colorText: "text-[#3A4B86]",
  },
  {
    id: "market_landscape",
    name: "Market Gap & Prior Art Agent",
    stage: "idea",
    stageLabel: "Stage 1: Idea (20%)",
    desc: "Performs real-time Tavily search across existing GitHub repositories, startups, and academic papers.",
    deterministicTool: "Live Web Search API Engine",
    metric: "Collision Rate",
    colorBg: "bg-[#DDE4F8]",
    colorText: "text-[#3A4B86]",
  },
  // Stage 2: PPT (3)
  {
    id: "tech_arch",
    name: "Technical Architecture Agent",
    stage: "ppt",
    stageLabel: "Stage 2: PPT (25%)",
    desc: "Parses PDF pitch deck and extracts system architecture, microservices, and database schemas for downstream verification.",
    deterministicTool: "PDF Text & OCR Parser Engine",
    metric: "Architecture Coherence",
    colorBg: "bg-[#FBF1D5]",
    colorText: "text-[#6E5416]",
  },
  {
    id: "presentation_coherence",
    name: "Presentation Narrative & Flow Agent",
    stage: "ppt",
    stageLabel: "Stage 2: PPT (25%)",
    desc: "Evaluates narrative structure, slide pacing, visual clarity, and data backing across presentation deck.",
    deterministicTool: "Slide OCR Density & Flow Parser",
    metric: "Deck Structure Score",
    colorBg: "bg-[#FBF1D5]",
    colorText: "text-[#6E5416]",
  },
  {
    id: "business_scalability",
    name: "Business Scalability Agent",
    stage: "ppt",
    stageLabel: "Stage 2: PPT (25%)",
    desc: "Assesses go-to-market plan, unit economics, infrastructure costs, and long-term scaling strategy.",
    deterministicTool: "Financial Logic & Unit Economics Parser",
    metric: "Scalability Index",
    colorBg: "bg-[#FBF1D5]",
    colorText: "text-[#6E5416]",
  },
  // Stage 3: Product (5)
  {
    id: "ui_ux_agent",
    name: "UI/UX Experience Agent",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Inspects live deployed application for visual polish, responsiveness, accessibility, and navigation flow.",
    deterministicTool: "Playwright Headless Browser + DOM Inspector",
    metric: "UX Polish Score",
    colorBg: "bg-[#D8EAD9]",
    colorText: "text-[#2D5A36]",
  },
  {
    id: "functionality_agent",
    name: "Core Functionality Agent",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Tests core user workflows, happy paths, edge cases, and API error boundaries against deployed endpoints.",
    deterministicTool: "Live HTTP Probe + E2E Workflow Test",
    metric: "Execution Reliability",
    colorBg: "bg-[#D8EAD9]",
    colorText: "text-[#2D5A36]",
  },
  {
    id: "code_quality_agent",
    name: "Code Quality & AST Agent",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Performs AST cyclomatic complexity inspection, modularity checks, and code hygiene audit on GitHub repository.",
    deterministicTool: "Radon AST Analyzer + Tree-sitter",
    metric: "Maintainability Index",
    colorBg: "bg-[#D8EAD9]",
    colorText: "text-[#2D5A36]",
  },
  {
    id: "security_agent",
    name: "Security & Vulnerability Agent",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Scans codebase for leaked credentials, OWASP Top 10 vulnerabilities, unescaped queries, and insecure dependencies.",
    deterministicTool: "Bandit AST Scanner + Semgrep Engine",
    metric: "Security Health Rating",
    colorBg: "bg-[#D8EAD9]",
    colorText: "text-[#2D5A36]",
  },
  {
    id: "real_world_impact",
    name: "Real-World Production Readiness Agent",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Measures overall production utility, operational telemetry, uptime SLA, and readiness for actual end users.",
    deterministicTool: "Live Uptime Monitor & Docker Inspector",
    metric: "Production Readiness",
    colorBg: "bg-[#D8EAD9]",
    colorText: "text-[#2D5A36]",
  },
  // Cross-Cutting (5)
  {
    id: "instant_feedback",
    name: "Sub-90s Instant Diagnostic Agent",
    stage: "cross",
    stageLabel: "Cross-Cutting Engine",
    desc: "Generates private, non-judged 8-dimensional diagnostic report with actionable fixes within 90 seconds of submission.",
    deterministicTool: "Asynchronous Celery Diagnostics Swarm",
    metric: "Turnaround < 90s",
    colorBg: "bg-[#EBE4F6]",
    colorText: "text-[#4F3B74]",
  },
  {
    id: "consistency_agent",
    name: "Cross-Stage Consistency Agent",
    stage: "cross",
    stageLabel: "Cross-Cutting Engine",
    desc: "Validates that technologies promised in Stage 2 PPT deck are actually implemented in Stage 3 GitHub repository.",
    deterministicTool: "Claim-to-AST Code Cross-Verifier",
    metric: "Claim Alignment Index",
    colorBg: "bg-[#EBE4F6]",
    colorText: "text-[#4F3B74]",
  },
  {
    id: "anti_cheating",
    name: "Anti-Cheating & Plagiarism Agent",
    stage: "cross",
    stageLabel: "Cross-Cutting Engine",
    desc: "Detects template cloning, commit spoofing, and semantic similarity against external open-source repos.",
    deterministicTool: "Git History & Semantic Vector Matcher",
    metric: "Plagiarism Risk Score",
    colorBg: "bg-[#EBE4F6]",
    colorText: "text-[#4F3B74]",
  },
  {
    id: "calibration_agent",
    name: "Confidence Calibration Agent",
    stage: "cross",
    stageLabel: "Cross-Cutting Engine",
    desc: "Normalizes AI confidence variances and calibrates evidence weights before presenting dossier to human judges.",
    deterministicTool: "Bayesian Calibration Algorithm",
    metric: "Calibration Margin",
    colorBg: "bg-[#EBE4F6]",
    colorText: "text-[#4F3B74]",
  },
  {
    id: "final_judge_agent",
    name: "70/30 Composite Finalization Agent",
    stage: "cross",
    stageLabel: "Cross-Cutting Engine",
    desc: "Blends 70% multi-agent AI deterministic evaluation with 30% calibrated human judge rubric for the final leaderboard.",
    deterministicTool: "Auditable Weighted Scoring Engine",
    metric: "Final Composite Rank",
    colorBg: "bg-[#EBE4F6]",
    colorText: "text-[#4F3B74]",
  },
];

export default function StudioWorkbenchHomePage() {
  const { role } = useAuth();

  // 1. Live Interactive Claim Sandbox State
  const [selectedScenario, setSelectedScenario] = useState<ClaimScenario>(CLAIM_SCENARIOS[0]);
  const [customClaimText, setCustomClaimText] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<number>(3);

  const handleRunVerify = (scenario: ClaimScenario) => {
    setSelectedScenario(scenario);
    setIsVerifying(true);
    setVerifyStep(1);

    setTimeout(() => setVerifyStep(2), 400);
    setTimeout(() => setVerifyStep(3), 800);
    setTimeout(() => {
      setIsVerifying(false);
    }, 1100);
  };

  // 2. Interactive 70/30 Hybrid Scoring Simulator State
  const [ideaScore, setIdeaScore] = useState<number>(88);
  const [pptScore, setPptScore] = useState<number>(90);
  const [productScore, setProductScore] = useState<number>(95);
  const [judgeScore, setJudgeScore] = useState<number>(92);
  const [aiWeight, setAiWeight] = useState<number>(70);

  const aiAggregate = useMemo(() => {
    const val = ideaScore * 0.2 + pptScore * 0.25 + productScore * 0.55;
    return Math.round(val * 10) / 10;
  }, [ideaScore, pptScore, productScore]);

  const finalComposite = useMemo(() => {
    const aiW = aiWeight / 100;
    const judgeW = (100 - aiWeight) / 100;
    const finalVal = aiAggregate * aiW + judgeScore * judgeW;
    return Math.round(finalVal * 10) / 10;
  }, [aiAggregate, judgeScore, aiWeight]);

  const gradeInfo = useMemo(() => {
    if (finalComposite >= 94) return { grade: "S-Tier Finalist", badge: "bg-[#D8EAD9] text-[#2D5A36]" };
    if (finalComposite >= 88) return { grade: "A+ Top 5%", badge: "bg-[#DDE4F8] text-[#3A4B86]" };
    if (finalComposite >= 80) return { grade: "A Rank", badge: "bg-[#FBF1D5] text-[#6E5416]" };
    return { grade: "B Rank", badge: "bg-[#F4EFE6] text-[#52525B]" };
  }, [finalComposite]);

  // 3. Agent Directory Filter State
  const [agentFilter, setAgentFilter] = useState<"all" | "idea" | "ppt" | "product" | "cross">("all");
  const [activeModalAgent, setActiveModalAgent] = useState<AgentDetail | null>(null);

  const filteredAgents = useMemo(() => {
    if (agentFilter === "all") return ALL_AGENTS;
    return ALL_AGENTS.filter((a) => a.stage === agentFilter);
  }, [agentFilter]);

  // 4. Interactive 3-Stage Studio Tab State
  const [activeStageKey, setActiveStageKey] = useState<"stage1" | "stage2" | "stage3" | "cross">("stage1");

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#18181B] relative overflow-x-hidden selection:bg-[#EBE4F6] selection:text-[#18181B]">
      {/* Subtle Architectural Grid Texture */}
      <div className="absolute inset-0 bg-nude-grid pointer-events-none opacity-60 z-0" />

      {/* ========================================================================= */}
      {/* 1. TOP ARCHITECTURAL WORKBENCH HEADER & CLAIM SANDBOX */}
      {/* ========================================================================= */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full z-10">
        {/* Top Status & Context Pill Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#E8E3D8] mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#EBE4F6] text-[#4F3B74] font-mono text-xs font-bold border border-[#D6CFBE]">
              JuryX Architecture Canvas
            </span>
            <span className="text-xs font-mono text-[#52525B]">
              Deterministic AST &bull; 17 Agent Swarm &bull; 70/30 Formula
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[#18181B] hover:text-[#3A4B86] flex items-center gap-1 font-mono transition-colors"
            >
              <span>Workspace Direct</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Asymmetrical Split: Editorial Statement Left / Live Claim Console Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Typographic Editorial Title & Context (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#52525B] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#E2DDD0] inline-block">
                Autonomous Judging Engine
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-normal text-[#18181B] leading-[1.08] tracking-tight">
                Evidence-grounded intelligence for <span className="italic font-normal text-[#3A4B86]">hackathon evaluation.</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-[#52525B] leading-relaxed font-normal">
              Eliminate reviewer fatigue and pitch deck bias. 17 specialized AI agents execute deterministic AST code inspections, slide claim OCR, and live endpoint checks to deliver calibrated 70/30 rankings.
            </p>

            {/* Quick Action Matrix */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 rounded-xl bg-[#18181B] text-white hover:bg-[#27272A] transition-all text-xs font-bold shadow-sm flex items-center gap-2 active:scale-95"
              >
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/leaderboard"
                className="px-5 py-2.5 rounded-xl bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] text-[#18181B] transition-all text-xs font-bold shadow-xs flex items-center gap-2"
              >
                <Trophy className="w-3.5 h-3.5 text-[#3A4B86]" />
                <span>Leaderboard</span>
              </Link>
            </div>

            {/* Micro KPI Callouts */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E8E3D8] text-xs font-mono">
              <div className="p-3 rounded-xl bg-white border border-[#E8E3D8]">
                <div className="text-[10px] text-[#71717A] uppercase">Swarm Agents</div>
                <div className="text-lg font-bold text-[#18181B] mt-0.5">17 Active</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E8E3D8]">
                <div className="text-[10px] text-[#71717A] uppercase">Diagnostics</div>
                <div className="text-lg font-bold text-[#2D5A36] mt-0.5">&lt; 90s SLA</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E8E3D8]">
                <div className="text-[10px] text-[#71717A] uppercase">Formula</div>
                <div className="text-lg font-bold text-[#3A4B86] mt-0.5">70% / 30%</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Claim Verification Workbench (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E3D8] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D8]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#3A4B86]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#18181B]">
                  Live Claim-to-Evidence Scanner
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#2D5A36] bg-[#D8EAD9] px-2.5 py-0.5 rounded-full font-bold">
                Interactive Console
              </span>
            </div>

            {/* Scenario Pills */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-[#71717A] uppercase font-semibold">
                Select Sample Student Claim:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CLAIM_SCENARIOS.map((scenario) => {
                  const isSelected = selectedScenario.id === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleRunVerify(scenario)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#FAF8F5] border-[#18181B] ring-1 ring-[#18181B] shadow-xs"
                          : "bg-white border-[#E8E3D8] hover:border-[#D6CFBE] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <span className="text-[10px] font-mono text-[#71717A] truncate">
                        {scenario.toolCategory}
                      </span>
                      <span className="font-bold text-[#18181B] line-clamp-1 mt-1">
                        {scenario.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Claim Statement Box */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] uppercase font-semibold">
                <span>{selectedScenario.stage}</span>
                <span className="text-[#3A4B86]">{selectedScenario.tool}</span>
              </div>
              <p className="text-xs font-semibold text-[#18181B] leading-relaxed">
                &quot;{selectedScenario.claimText}&quot;
              </p>
            </div>

            {/* Scan Action & Output Dossier */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleRunVerify(selectedScenario)}
                  disabled={isVerifying}
                  leftIcon={
                    isVerifying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-white" />
                    )
                  }
                  className="bg-[#18181B] hover:bg-[#27272A] text-white gap-1.5 text-xs font-mono font-bold"
                >
                  {isVerifying ? "Executing Scanners..." : "Re-Scan with Swarm"}
                </Button>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#71717A]">Confidence:</span>
                  <span className="font-bold text-[#2D5A36] bg-[#D8EAD9] px-2 py-0.5 rounded-md">
                    {selectedScenario.confidence}% Grounded
                  </span>
                </div>
              </div>

              {/* Factual Output Box */}
              <div className="p-3.5 rounded-xl bg-[#18181B] text-white font-mono text-xs space-y-1.5 shadow-inner">
                <div className="text-[10px] text-[#A1A1AA] uppercase flex items-center justify-between">
                  <span>Deterministic Tool Output:</span>
                  <span className="text-[#D8EAD9] font-bold">Latency {selectedScenario.latency}</span>
                </div>
                <div className="text-[#D8EAD9] leading-relaxed">{selectedScenario.proof}</div>
                <div className="text-[#D4D4D8] text-[11px] pt-1 border-t border-zinc-800 leading-normal">
                  {selectedScenario.finding}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THREE-STAGE ORCHESTRATION PIPELINE (BENTO CANVAS) */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#F4EFE6] border-y border-[#E8E3D8] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#52525B] font-bold">
                Evaluation Core Architecture
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#18181B] tracking-tight mt-1">
                Progressive Three-Stage Verification Swarm
              </h2>
            </div>

            {/* Stage Selector Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E8E3D8] rounded-xl shadow-xs overflow-x-auto">
              {(
                [
                  { key: "stage1", label: "Stage 1: Idea (20%)" },
                  { key: "stage2", label: "Stage 2: PPT (25%)" },
                  { key: "stage3", label: "Stage 3: Product (55%)" },
                  { key: "cross", label: "Cross-Cutting Engine" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveStageKey(tab.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer shrink-0 ${
                    activeStageKey === tab.key
                      ? "bg-[#18181B] text-white shadow-xs"
                      : "text-[#52525B] hover:text-[#18181B] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Stage Dynamic Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Deliverable & Methodology */}
            <div className="nude-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-[#71717A]">
                  Stage Input Contract
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#DDE4F8] text-[#3A4B86]">
                  {activeStageKey === "stage1"
                    ? "20% Weight"
                    : activeStageKey === "stage2"
                    ? "25% Weight"
                    : activeStageKey === "stage3"
                    ? "55% Weight"
                    : "Continuous Core"}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#18181B]">
                {activeStageKey === "stage1" && "Problem Novelty, Impact & Technical Moat"}
                {activeStageKey === "stage2" && "System Architecture & Slide Microservices"}
                {activeStageKey === "stage3" && "Repository AST Quality & Live Deployment"}
                {activeStageKey === "cross" && "Cross-Stage Consistency & Anti-Cheating"}
              </h3>

              <p className="text-xs text-[#52525B] leading-relaxed">
                {activeStageKey === "stage1" &&
                  "Participants submit structured Markdown problem statements. 4 specialized agents query live Tavily web search to measure market defensibility and prior-art collision."}
                {activeStageKey === "stage2" &&
                  "Inspects PDF architecture decks using OCR text extraction. Maps microservice promises, database schemas, and caching layers for downstream cross-stage code matching."}
                {activeStageKey === "stage3" &&
                  "Performs automated AST cyclomatic complexity analysis on GitHub code with Radon, scans for OWASP vulnerabilities with Bandit, and verifies live web URLs via Playwright."}
                {activeStageKey === "cross" &&
                  "Monitors submission discrepancies, issues sub-90s private diagnostics, detects template plagiarism, and normalizes AI variance with Bayesian confidence calibration."}
              </p>
            </div>

            {/* Card 2: Deterministic Tools & Scanners */}
            <div className="nude-card p-6 rounded-2xl space-y-4">
              <span className="text-xs font-mono uppercase font-bold text-[#71717A]">
                Underlying Deterministic Scanners
              </span>

              <div className="space-y-2.5">
                {activeStageKey === "stage1" && (
                  <>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#3A4B86]" />
                      <span>Tavily Real-Time Web Search API</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#3A4B86]" />
                      <span>Cosine Vector Embedding Similarity</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#3A4B86]" />
                      <span>TAM/SAM Problem Magnitude Model</span>
                    </div>
                  </>
                )}

                {activeStageKey === "stage2" && (
                  <>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#6E5416]" />
                      <span>PyPDF &amp; OCR Slide Text Parser</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#6E5416]" />
                      <span>Claim Extraction &amp; Schema Mapper</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#6E5416]" />
                      <span>Slide Flow &amp; Narrative Density Analyzer</span>
                    </div>
                  </>
                )}

                {activeStageKey === "stage3" && (
                  <>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#2D5A36]" />
                      <span>Radon AST Cyclomatic Complexity</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#2D5A36]" />
                      <span>Bandit OWASP &amp; Secret Key Scanner</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#2D5A36]" />
                      <span>Playwright Headless DOM Reachability</span>
                    </div>
                  </>
                )}

                {activeStageKey === "cross" && (
                  <>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#4F3B74]" />
                      <span>Asynchronous Celery Diagnostics Swarm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#4F3B74]" />
                      <span>Git History &amp; Template Clone Verifier</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-mono flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#4F3B74]" />
                      <span>Bayesian Confidence Calibration Algorithm</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Card 3: Active Swarm Agents in this Stage */}
            <div className="nude-card p-6 rounded-2xl space-y-4">
              <span className="text-xs font-mono uppercase font-bold text-[#71717A]">
                Active Specialized Agents
              </span>

              <div className="space-y-2">
                {ALL_AGENTS.filter((a) =>
                  activeStageKey === "stage1"
                    ? a.stage === "idea"
                    : activeStageKey === "stage2"
                    ? a.stage === "ppt"
                    : activeStageKey === "stage3"
                    ? a.stage === "product"
                    : a.stage === "cross"
                ).map((agent, i) => (
                  <div
                    key={agent.id}
                    onClick={() => setActiveModalAgent(agent)}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#18181B] transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#71717A]">0{i + 1}</span>
                      <span className="font-bold text-[#18181B] truncate max-w-[180px]">
                        {agent.name}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LIVE 70/30 HYBRID SCORING CALCULATOR */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDE4F8] text-[#3A4B86] text-xs font-mono font-bold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Mathematical Rigor Sandbox</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            70% AI Swarm + 30% Calibrated Human Formula
          </h2>
          <p className="text-xs sm:text-sm text-[#52525B] mt-1">
            Drag the stage scores and judge rubric below to simulate real-time leaderboard ranking calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-[#E8E3D8] p-6 sm:p-8 shadow-sm">
          {/* Sliders (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#18181B]">Stage 1: Idea &amp; Feasibility (20% Weight)</span>
                <span className="font-bold text-[#3A4B86] bg-[#DDE4F8] px-2 py-0.5 rounded">
                  {ideaScore} / 100
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={ideaScore}
                onChange={(e) => setIdeaScore(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E8E3D8] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#18181B]">Stage 2: Architecture Deck (25% Weight)</span>
                <span className="font-bold text-[#6E5416] bg-[#FBF1D5] px-2 py-0.5 rounded">
                  {pptScore} / 100
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={pptScore}
                onChange={(e) => setPptScore(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E8E3D8] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#18181B]">Stage 3: Product Code &amp; Deploy (55% Weight)</span>
                <span className="font-bold text-[#2D5A36] bg-[#D8EAD9] px-2 py-0.5 rounded">
                  {productScore} / 100
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={productScore}
                onChange={(e) => setProductScore(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E8E3D8] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-[#E8E3D8] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#18181B] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#3A4B86]" />
                  Human Judge Calibrated Rating (30% Composite Weight)
                </span>
                <span className="font-bold text-white bg-[#18181B] px-2 py-0.5 rounded">
                  {judgeScore} / 100
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={judgeScore}
                onChange={(e) => setJudgeScore(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E8E3D8] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Result Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#FAF8F5] rounded-xl border border-[#E8E3D8] p-6 space-y-4 text-center">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#E8E3D8]">
              <span className="text-[#71717A] uppercase font-bold">Composite Outcome</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${gradeInfo.badge}`}>
                {gradeInfo.grade}
              </span>
            </div>

            <div className="py-2">
              <div className="text-5xl font-mono font-black text-[#18181B]">
                {finalComposite}
                <span className="text-sm font-normal text-[#71717A] ml-1">/ 100</span>
              </div>
              <div className="text-xs font-mono text-[#52525B] mt-1">
                70% AI Swarm ({aiAggregate}) + 30% Judge ({judgeScore})
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-left">
              <div className="p-2 rounded bg-white border border-[#E8E3D8] flex justify-between">
                <span className="text-[#71717A]">AI Swarm Contribution:</span>
                <span className="font-bold text-[#18181B]">{aiAggregate} pts</span>
              </div>
              <div className="p-2 rounded bg-white border border-[#E8E3D8] flex justify-between">
                <span className="text-[#71717A]">Judge Calibration Contribution:</span>
                <span className="font-bold text-[#3A4B86]">{judgeScore} pts</span>
              </div>
            </div>

            <Link href="/dashboard" className="block pt-1">
              <Button size="sm" variant="primary" className="w-full bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-bold font-mono">
                Open Workspace with This Formula
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE 17-AGENT DIRECTORY MATRIX */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#F4EFE6] border-t border-[#E8E3D8] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#52525B] font-bold">
                Swarm Registry
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#18181B] tracking-tight mt-1">
                17 Deterministic Evaluation Agents
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E8E3D8] rounded-xl shadow-xs overflow-x-auto">
              {(
                [
                  { key: "all", label: "All 17 Agents" },
                  { key: "idea", label: "Idea (4)" },
                  { key: "ppt", label: "PPT (3)" },
                  { key: "product", label: "Product (5)" },
                  { key: "cross", label: "Cross-Cutting (5)" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setAgentFilter(tab.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer shrink-0 ${
                    agentFilter === tab.key
                      ? "bg-[#18181B] text-white shadow-xs"
                      : "text-[#52525B] hover:text-[#18181B] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setActiveModalAgent(agent)}
                className="nude-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${agent.colorBg} ${agent.colorText}`}>
                      {agent.stageLabel}
                    </span>
                    <span className="text-[10px] font-mono text-[#71717A]">#{agent.id}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#18181B] group-hover:text-[#3A4B86] transition-colors">
                    {agent.name}
                  </h3>

                  <p className="text-xs text-[#52525B] mt-1.5 line-clamp-2 leading-relaxed">
                    {agent.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E3D8] text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-[#71717A]">
                    <span>Tool:</span>
                    <span className="text-[#18181B] truncate max-w-[170px]">{agent.deterministicTool}</span>
                  </div>
                  <div className="flex justify-between text-[#71717A]">
                    <span>Metric:</span>
                    <span className="text-[#2D5A36] font-bold">{agent.metric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SUB-90S PARTICIPANT DIAGNOSTIC SUITE */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8EAD9] text-[#2D5A36] text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Participant Empowerment</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#18181B] tracking-tight">
              Instant Private Diagnostics in Under 90 Seconds
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Students receive a comprehensive, non-judged health audit immediately upon submission. Spot AST complexity bottlenecks, missing CORS whitelists, and unpinned dependencies before the final judging freeze.
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs text-[#52525B]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A36] shrink-0" />
                <span>8-Dimension Radar (AST, Security, Novelty, UX, Scalability)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A36] shrink-0" />
                <span>Line-by-line actionable code fix recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A36] shrink-0" />
                <span>Unlimited pre-deadline resubmissions</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/dashboard">
                <Button size="sm" variant="primary" className="bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-bold font-mono">
                  Test Instant Diagnostic in Studio
                </Button>
              </Link>
            </div>
          </div>

          {/* Diagnostic Sample Preview Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E8E3D8] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E3D8]">
              <span className="text-xs font-mono font-bold uppercase text-[#18181B]">
                Sample Diagnostic Report (#diag-8291)
              </span>
              <span className="text-[10px] font-mono text-[#2D5A36] bg-[#D8EAD9] px-2 py-0.5 rounded font-bold">
                87.4s Turnaround
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] flex justify-between">
                <span className="text-[#71717A]">Code Quality:</span>
                <span className="font-bold text-[#2D5A36]">96/100</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] flex justify-between">
                <span className="text-[#71717A]">OWASP Security:</span>
                <span className="font-bold text-[#2D5A36]">98/100</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] flex justify-between">
                <span className="text-[#71717A]">Novelty &amp; Moat:</span>
                <span className="font-bold text-[#3A4B86]">93/100</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] flex justify-between">
                <span className="text-[#71717A]">Live URL Reach:</span>
                <span className="font-bold text-[#2D5A36]">91/100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] space-y-1">
              <div className="text-[10px] font-mono text-[#7A3A30] uppercase font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Actionable Recommendation:
              </div>
              <p className="text-xs font-mono text-[#18181B] leading-relaxed">
                &quot;FastAPI CORS origins set to &apos;*&apos; in backend/main.py:34. Add restricted domain whitelist before final freeze to earn maximum 100% security score.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ACTIVE HACKATHONS & ROLE PORTALS */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#F4EFE6] border-t border-[#E8E3D8] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#18181B] tracking-tight">
              Tailored Portals for Every Role
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] mt-1">
              Switch roles seamlessly in the top right to test the engine from any perspective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Participant */}
            <div className="nude-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#DDE4F8] text-[#3A4B86] flex items-center justify-center font-bold">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-bold text-[#18181B]">Student Participant</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Enroll into hackathons, submit 3-stage deliverables (Idea, PPT, Code Repos), and get private sub-90s feedback.
                </p>
              </div>

              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="w-full justify-between text-xs font-mono font-bold">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Research Judge */}
            <div className="nude-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D8EAD9] text-[#2D5A36] flex items-center justify-center font-bold">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-bold text-[#18181B]">Research Judge</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Review factual AI evidence dossiers, inspect deterministic tool proof, and submit your 30% calibrated rubric rating.
                </p>
              </div>

              <Link href="/judge">
                <Button size="sm" variant="outline" className="w-full justify-between text-xs font-mono font-bold">
                  <span>Open Judge Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Tournament Director */}
            <div className="nude-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5DCD7] text-[#7A3A30] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-bold text-[#18181B]">Tournament Director</h3>
                <p className="text-xs text-[#52525B] leading-relaxed">
                  Configure rubric weights, inspect plagiarism &amp; anti-cheating telemetry, and trigger 70/30 final rankings.
                </p>
              </div>

              <Link href="/admin">
                <Button size="sm" variant="outline" className="w-full justify-between text-xs font-mono font-bold">
                  <span>Admin Control Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Modal Detail Inspector */}
      {activeModalAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveModalAgent(null)}
        >
          <div
            className="w-full max-w-lg bg-white border border-[#E8E3D8] rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E3D8]">
              <div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md ${activeModalAgent.colorBg} ${activeModalAgent.colorText}`}>
                  {activeModalAgent.stageLabel}
                </span>
                <h3 className="text-base font-bold text-[#18181B] mt-1.5">{activeModalAgent.name}</h3>
              </div>
              <button
                onClick={() => setActiveModalAgent(null)}
                className="text-[#71717A] hover:text-[#18181B] p-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] space-y-1">
                <span className="text-[10px] font-mono text-[#71717A] uppercase font-semibold">
                  Agent Mandate &amp; Objective:
                </span>
                <p className="text-[#18181B] leading-relaxed">{activeModalAgent.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] space-y-1">
                  <span className="text-[10px] text-[#71717A] uppercase">Deterministic Tool:</span>
                  <div className="text-[#18181B] font-bold truncate">{activeModalAgent.deterministicTool}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] space-y-1">
                  <span className="text-[10px] text-[#71717A] uppercase">Scoring Metric:</span>
                  <div className="text-[#2D5A36] font-bold truncate">{activeModalAgent.metric}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setActiveModalAgent(null)} className="text-xs font-mono font-bold">
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
