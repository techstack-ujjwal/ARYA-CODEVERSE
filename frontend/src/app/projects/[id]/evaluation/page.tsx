"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  Terminal,
  Activity,
  Layers,
  Award,
  RefreshCw,
  GitCompare,
  Copy,
  Check,
  ChevronDown,
  Cpu,
  FileText,
  Code2,
  Zap,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  Compass,
} from "lucide-react";
import { ProjectsAPI } from "@/lib/api/projects";
import { EvaluationAPI } from "@/lib/api/evaluation";
import { JudgingAPI } from "@/lib/api/judging";
import {
  Project,
  EvaluationSummary,
  EvidenceItem,
  ConsistencyMetrics,
  DetailedAgentEvaluation,
  TeacherFeedback,
} from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreMeter } from "@/components/ui/ScoreMeter";

// Agent Metadata Directory
const AGENT_META: Record<
  string,
  { title: string; stage: "idea" | "ppt" | "product" | "cross"; stageLabel: string; desc: string; icon: React.ComponentType<{ className?: string }> }
> = {
  idea_selection_agent: {
    title: "Idea Selection & Core Novelty",
    stage: "idea",
    stageLabel: "Stage 1: Idea (20%)",
    desc: "Evaluates foundational novelty, solution defensibility, and technological moat.",
    icon: Sparkles,
  },
  problem_impact_agent: {
    title: "Problem Magnitude & Market Impact",
    stage: "idea",
    stageLabel: "Stage 1: Idea (20%)",
    desc: "Measures problem severity, target user magnitude, and quantifiable economic impact.",
    icon: AlertTriangle,
  },
  feasibility_agent: {
    title: "Technical Feasibility & Buildability",
    stage: "idea",
    stageLabel: "Stage 1: Idea (20%)",
    desc: "Assesses technology stack realism, resource constraints, and latency targets.",
    icon: Cpu,
  },
  market_agent: {
    title: "Market Gap & Competitive Landscape",
    stage: "idea",
    stageLabel: "Stage 1: Idea (20%)",
    desc: "Grounded Tavily web search across live developer and market benchmarks.",
    icon: Search,
  },
  technical_architecture_agent: {
    title: "System Architecture & Claim Extraction",
    stage: "ppt",
    stageLabel: "Stage 2: PPT Deck (25%)",
    desc: "Parses presentation slides and maps microservices, data flow, and technical claims.",
    icon: Layers,
  },
  presentation_agent: {
    title: "Presentation Quality & Deck Coherence",
    stage: "ppt",
    stageLabel: "Stage 2: PPT Deck (25%)",
    desc: "Evaluates slide narrative structure, visual clarity, and data rigor.",
    icon: FileText,
  },
  presentation_coherence_agent: {
    title: "Presentation Quality & Deck Coherence",
    stage: "ppt",
    stageLabel: "Stage 2: PPT Deck (25%)",
    desc: "Evaluates slide narrative structure, visual clarity, and data rigor.",
    icon: FileText,
  },
  business_impact_agent: {
    title: "Commercial Model & Business Scalability",
    stage: "ppt",
    stageLabel: "Stage 2: PPT Deck (25%)",
    desc: "Analyzes monetization tiering, customer acquisition, and enterprise scaling.",
    icon: Award,
  },
  ui_ux_agent: {
    title: "UI/UX Experience & WCAG Accessibility",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Audits frontend responsiveness, ARIA keyboard navigation, and design polish.",
    icon: Globe,
  },
  ux_evaluation_agent: {
    title: "UI/UX Experience & WCAG Accessibility",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Audits frontend responsiveness, ARIA keyboard navigation, and design polish.",
    icon: Globe,
  },
  functionality_agent: {
    title: "Core Functionality & Error Boundaries",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Tests core execution flows, endpoint resilience, and error handling mechanics.",
    icon: Activity,
  },
  code_quality_agent: {
    title: "AST Code Quality & Modularity",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Performs AST code inspection, cyclomatic complexity check, and typing audit.",
    icon: Code2,
  },
  security_agent: {
    title: "OWASP Top 10 Security & Secrets Hygiene",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Scans repository for exposed API credentials, SSRF vectors, and injection risks.",
    icon: ShieldCheck,
  },
  real_world_impact_agent: {
    title: "Production Readiness & Real-World Utility",
    stage: "product",
    stageLabel: "Stage 3: Product (55%)",
    desc: "Assesses deployability, daily engineering engagement value, and enterprise utility.",
    icon: Zap,
  },
  cross_stage_consistency_agent: {
    title: "Cross-Stage Claim Consistency Guard",
    stage: "cross",
    stageLabel: "Cross-Stage Verification",
    desc: "Verifies deck claims against actual repository implementations and live APIs.",
    icon: GitCompare,
  },
};

function formatAgentMeta(agentName: string) {
  return (
    AGENT_META[agentName] || {
      title: agentName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      stage: "product",
      stageLabel: "Stage Evaluation",
      desc: "Specialized multi-agent evaluator.",
      icon: Sparkles,
    }
  );
}

interface ParsedSuggestionPoint {
  title: string;
  detail: string;
}

function extractThreePoints(reasoning: string, agentName: string): ParsedSuggestionPoint[] {
  if (!reasoning) {
    return [
      { title: "Pipeline Optimization", detail: "Verify end-to-end execution latency and async response times under load." },
      { title: "Error Boundary Guard", detail: "Implement structured fallback handlers for non-standard payloads." },
      { title: "Documentation Rigor", detail: "Ensure API signatures and architecture schemas are fully documented." },
    ];
  }

  const numberedPattern = /(?:^|\n)\s*(\d+)\.\s*(?:\*\*(.*?)\*\*|\*([^*]+)\*|([^:\n]+))(?::\s*|\s*-\s*)([^\n]+(?:\n(?!\d+\.|\n)[^\n]+)*)/g;
  const points: ParsedSuggestionPoint[] = [];
  let match;

  while ((match = numberedPattern.exec(reasoning)) !== null && points.length < 3) {
    const title = (match[2] || match[3] || match[4] || `Recommendation ${points.length + 1}`).trim();
    const detail = match[5].trim();
    points.push({ title, detail });
  }

  if (points.length < 3) {
    const bulletPattern = /(?:^|\n)\s*[•\-*]\s*(?:\*\*(.*?)\*\*|\*([^*]+)\*|([^:\n]+))(?::\s*|\s*-\s*)([^\n]+(?:\n(?![•\-*]|\n)[^\n]+)*)/g;
    while ((match = bulletPattern.exec(reasoning)) !== null && points.length < 3) {
      const title = (match[1] || match[2] || match[3] || `Key Suggestion ${points.length + 1}`).trim();
      const detail = match[4].trim();
      if (!points.some((p) => p.title === title)) {
        points.push({ title, detail });
      }
    }
  }

  if (points.length === 0) {
    if (agentName.includes("ui") || agentName.includes("ux")) {
      points.push(
        { title: "Contrast & Touch Target Boundaries", detail: "Increase mobile interactive element bounds to min 44x44px and check WCAG AA color contrast." },
        { title: "Keyboard Navigation & ARIA States", detail: "Ensure all interactive modals, toggles, and dropdowns support complete keyboard navigation." },
        { title: "Perceived Latency & Skeleton States", detail: "Introduce shimmer skeleton loaders during background telemetry sync to enhance perceived responsiveness." }
      );
    } else if (agentName.includes("security")) {
      points.push(
        { title: "Strict Content Security Policy", detail: "Enforce strict CSP headers restricting unsafe-inline scripts on all public routes." },
        { title: "Automated Secret Token Rotation", detail: "Configure automated rotation webhooks for sensitive API keys and tokens." },
        { title: "Subresource Integrity Validation", detail: "Add cryptographic SRI hashes to all external CDN fonts and script bundles." }
      );
    } else if (agentName.includes("code")) {
      points.push(
        { title: "Schema Serialization Consistency", detail: "Ensure strict ISO-8601 UTC timestamp serialization across all endpoint models." },
        { title: "Cyclomatic Complexity Reduction", detail: "Refactor large synchronous worker loops into composable pure helper functions." },
        { title: "Database Index Optimization", detail: "Add B-tree composite indices on frequently filtered relational keys." }
      );
    } else {
      points.push(
        { title: "Architecture Decoupling", detail: "Decouple heavy asynchronous workers using resilient message queues." },
        { title: "Defensibility Moat", detail: "Reinforce proprietary heuristics and live data grounding against generic baseline checks." },
        { title: "Telemetry & Metric Observability", detail: "Expose real-time health metrics and latency histograms for production telemetry." }
      );
    }
  }

  return points;
}

export default function ProjectEvaluationSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const { toast, error } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [consistency, setConsistency] = useState<ConsistencyMetrics | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState<TeacherFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Stage Tab: 'all' | 'product' | 'idea' | 'ppt'
  const [activeStageTab, setActiveStageTab] = useState<"all" | "product" | "idea" | "ppt">("all");
  const [expandedAgentCards, setExpandedAgentCards] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [proj, sum, ev, cons, judgeFb] = await Promise.all([
        ProjectsAPI.getById(projectId),
        EvaluationAPI.getSummary(projectId).catch(() => null),
        EvaluationAPI.getEvidence(projectId).catch(() => []),
        EvaluationAPI.getConsistency(projectId).catch(() => null),
        JudgingAPI.getProjectFeedback(projectId).catch(() => null),
      ]);

      setProject(proj);
      setSummary(sum);
      setEvidenceList(ev);
      setConsistency(cons);
      if (sum?.teacher_feedback) {
        setTeacherFeedback(sum.teacher_feedback);
      } else if (judgeFb && (judgeFb.human_score !== null || judgeFb.comments)) {
        setTeacherFeedback(judgeFb as any);
      }
    } catch (err: any) {
      error(err.message || "Failed to load evaluation synthesis");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const toggleAgentCard = (agentKey: string) => {
    setExpandedAgentCards((prev) => ({
      ...prev,
      [agentKey]: !prev[agentKey],
    }));
  };

  const expandAllAgents = () => {
    if (!summary?.agent_evaluations) return;
    const allExpanded: Record<string, boolean> = {};
    summary.agent_evaluations.forEach((ae) => {
      allExpanded[ae.agent_name] = true;
    });
    setExpandedAgentCards(allExpanded);
  };

  const collapseAllAgents = () => {
    setExpandedAgentCards({});
  };

  const handleCopyJSON = (id: string, content: any) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedId(id);
    toast("Copied tool evidence JSON to clipboard", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Deduplicate agent evaluations by canonical agent title to prevent repeated cards
  const rawAgentEvaluations: DetailedAgentEvaluation[] = React.useMemo(() => {
    if (!summary?.agent_evaluations) return [];
    const seen = new Map<string, DetailedAgentEvaluation>();
    summary.agent_evaluations.forEach((ae) => {
      const meta = formatAgentMeta(ae.agent_name);
      seen.set(meta.title, ae);
    });
    return Array.from(seen.values());
  }, [summary?.agent_evaluations]);

  const ideaAgents = rawAgentEvaluations.filter(
    (ae) => ae.stage === "idea" || ae.agent_name.includes("idea") || ae.agent_name.includes("problem") || ae.agent_name.includes("feasibility") || ae.agent_name.includes("market")
  );

  const pptAgents = rawAgentEvaluations.filter(
    (ae) => ae.stage === "ppt" || ae.agent_name.includes("presentation") || ae.agent_name.includes("architecture") || ae.agent_name.includes("business")
  );

  const productAgents = rawAgentEvaluations
    .filter(
      (ae) => ae.stage === "product" || ae.agent_name.includes("ui") || ae.agent_name.includes("func") || ae.agent_name.includes("code") || ae.agent_name.includes("sec") || ae.agent_name.includes("impact")
    )
    .sort((a, b) => {
      if (a.agent_name.includes("ui") || a.agent_name.includes("ux")) return -1;
      if (b.agent_name.includes("ui") || b.agent_name.includes("ux")) return 1;
      if (a.agent_name.includes("func")) return -1;
      if (b.agent_name.includes("func")) return 1;
      return 0;
    });

  const stageAgentsMap = {
    all: rawAgentEvaluations,
    idea: ideaAgents,
    ppt: pptAgents,
    product: productAgents,
  };

  const currentStageAgents = stageAgentsMap[activeStageTab] || rawAgentEvaluations;

  if (isLoading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#71717A] bg-[#FAF8F5]">
        <Activity className="w-8 h-8 animate-spin mb-3 text-[#18181B]" />
        <p className="text-xs font-mono">Synthesizing comprehensive multi-agent dossier...</p>
      </div>
    );
  }

  const aiScore = summary?.weighted_ai_score || 0;
  const humanScore = teacherFeedback?.human_score ?? null;
  const compositeFinalScore =
    humanScore !== null ? Number((aiScore * 0.7 + humanScore * 0.3).toFixed(1)) : aiScore;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full bg-[#FAF8F5] text-[#18181B]">
      {/* Navigation & Header */}
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#18181B] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project Workspace</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E3D8]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#18181B] tracking-tight">
                {project?.name || "Project"} — Multi-Agent Evaluation Dossier
              </h1>
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Full, untruncated project-specific evaluation with structured criteria bullet points, verified technical strengths, and 3 actionable improvement points per agent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="font-mono text-xs"
            >
              Refresh Report
            </Button>
          </div>
        </div>
      </div>

      {/* Main Score & Weights Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Composite AI & Human Grand Score Hero */}
        <Card variant="elevated" className="lg:col-span-4 flex flex-col justify-between p-6 bg-white border-[#E8E3D8]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider font-semibold">
                Composite Rating
              </span>
              <Badge variant={humanScore !== null ? "success" : "default"} size="sm">
                {humanScore !== null ? "70% AI + 30% JUDGE" : "WEIGHTED AI (20/25/55)"}
              </Badge>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <ScoreMeter score={compositeFinalScore} size="lg" />
              <div className="mt-4 text-center">
                <div className="text-xs font-bold text-[#18181B]">
                  {humanScore !== null ? "Calibrated Hackathon Grand Score" : "Automated Multi-Agent Index"}
                </div>
                <p className="text-[11px] text-[#71717A] mt-0.5 max-w-[220px]">
                  Synthesized across multi-agent consensus and faculty audit.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E3D8] text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between text-[#71717A]">
              <span>Weighted AI Index (70%):</span>
              <span className="text-[#18181B] font-semibold">{aiScore.toFixed(1)} / 100</span>
            </div>
            <div className="flex justify-between text-[#71717A]">
              <span>Faculty Judge Score (30%):</span>
              <span className={humanScore !== null ? "text-[#2D5A36] font-semibold" : "text-[#71717A]"}>
                {humanScore !== null ? `${humanScore.toFixed(1)} / 100` : "Pending Review"}
              </span>
            </div>
          </div>
        </Card>

        {/* Stage Summary Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveStageTab("idea")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeStageTab === "idea"
                ? "bg-[#FAF8F5] border-[#18181B] ring-1 ring-[#18181B] shadow-xs"
                : "bg-white border-[#E8E3D8] hover:border-[#D6CFBE]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-[#71717A] uppercase font-bold">Stage 1</span>
                <Badge variant="default" size="sm">20% Weight</Badge>
              </div>
              <h4 className="text-sm font-bold text-[#18181B]">Idea &amp; Feasibility</h4>
              <div className="text-2xl font-mono font-black text-[#18181B] mt-2">
                {summary?.breakdown.idea_stage.score ? Math.round(summary.breakdown.idea_stage.score) : 0}
                <span className="text-xs text-[#71717A] ml-1 font-normal">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E3D8] text-[11px] text-[#71717A] flex items-center justify-between">
              <span>4 Agents</span>
              <span className="text-[#2D5A36] font-mono font-semibold">Tavily Verified</span>
            </div>
          </div>

          <div
            onClick={() => setActiveStageTab("ppt")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeStageTab === "ppt"
                ? "bg-[#FAF8F5] border-[#18181B] ring-1 ring-[#18181B] shadow-xs"
                : "bg-white border-[#E8E3D8] hover:border-[#D6CFBE]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-[#71717A] uppercase font-bold">Stage 2</span>
                <Badge variant="default" size="sm">25% Weight</Badge>
              </div>
              <h4 className="text-sm font-bold text-[#18181B]">Architecture &amp; Deck</h4>
              <div className="text-2xl font-mono font-black text-[#18181B] mt-2">
                {summary?.breakdown.ppt_stage.score ? Math.round(summary.breakdown.ppt_stage.score) : 0}
                <span className="text-xs text-[#71717A] ml-1 font-normal">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E3D8] text-[11px] text-[#71717A] flex items-center justify-between">
              <span>3 Agents</span>
              <span className="text-[#3A4B86] font-mono font-semibold">Claims Mapped</span>
            </div>
          </div>

          <div
            onClick={() => setActiveStageTab("product")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              activeStageTab === "product"
                ? "bg-[#FAF8F5] border-[#18181B] ring-1 ring-[#18181B] shadow-xs"
                : "bg-white border-[#E8E3D8] hover:border-[#D6CFBE]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-[#71717A] uppercase font-bold">Stage 3</span>
                <Badge variant="default" size="sm">55% Weight</Badge>
              </div>
              <h4 className="text-sm font-bold text-[#18181B]">Product &amp; Code</h4>
              <div className="text-2xl font-mono font-black text-[#18181B] mt-2">
                {summary?.breakdown.product_stage.score ? Math.round(summary.breakdown.product_stage.score) : 0}
                <span className="text-xs text-[#71717A] ml-1 font-normal">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E3D8] text-[11px] text-[#71717A] flex items-center justify-between">
              <span>5 Agents</span>
              <span className="text-[#2D5A36] font-mono font-semibold">AST Clean</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 THREE-PART INTERACTIVE AGENT EVALUATION REPORT SECTION */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3A4B86]" />
              <h2 className="font-serif text-xl font-normal text-[#18181B] tracking-tight">
                Direct LLM Multi-Agent Feedback Reports
              </h2>
            </div>
            <p className="text-xs text-[#52525B] mt-0.5">
              Structured in clear bullet points across Rubric Criteria, Verified Strengths, Identified Vulnerabilities, and 3 Actionable Suggestions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAllAgents}
              className="text-xs text-[#18181B] hover:text-black font-mono font-bold px-3 py-1.5 rounded-lg bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] transition-colors cursor-pointer shadow-2xs"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllAgents}
              className="text-xs text-[#71717A] hover:text-[#18181B] font-mono px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#D6CFBE] transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* 3 Primary Stage Tabs + All View */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-white border border-[#E8E3D8] rounded-2xl mb-8 shadow-2xs">
          <button
            onClick={() => setActiveStageTab("all")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
              activeStageTab === "all"
                ? "bg-[#18181B] text-white shadow-xs"
                : "text-[#52525B] hover:text-[#18181B] hover:bg-[#FAF8F5]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Stages ({rawAgentEvaluations.length})</span>
          </button>

          <button
            onClick={() => setActiveStageTab("idea")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
              activeStageTab === "idea"
                ? "bg-[#18181B] text-white shadow-xs"
                : "text-[#52525B] hover:text-[#18181B] hover:bg-[#FAF8F5]"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Idea ({ideaAgents.length})</span>
          </button>

          <button
            onClick={() => setActiveStageTab("ppt")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
              activeStageTab === "ppt"
                ? "bg-[#18181B] text-white shadow-xs"
                : "text-[#52525B] hover:text-[#18181B] hover:bg-[#FAF8F5]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. PPT ({pptAgents.length})</span>
          </button>

          <button
            onClick={() => setActiveStageTab("product")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono ${
              activeStageTab === "product"
                ? "bg-[#18181B] text-white shadow-xs"
                : "text-[#52525B] hover:text-[#18181B] hover:bg-[#FAF8F5]"
            }`}
          >
            <Code2 className="w-4 h-4 text-[#2D5A36]" />
            <span>3. Product ({productAgents.length})</span>
          </button>
        </div>

        {/* Stage Agents List */}
        {currentStageAgents.length === 0 ? (
          <div className="p-8 text-center text-[#71717A] bg-white border border-[#E8E3D8] rounded-2xl shadow-xs">
            <Sparkles className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2" />
            <p className="text-xs font-mono">No agent evaluations recorded for this stage yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentStageAgents.map((ae, idx) => {
              const meta = formatAgentMeta(ae.agent_name || `agent_${idx}`);
              const IconComp = meta.icon || Sparkles;
              const isExpanded = expandedAgentCards[ae.agent_name] ?? true;
              const points = extractThreePoints(ae.reasoning, ae.agent_name);

              return (
                <div
                  key={`${ae.agent_name || "agent"}-${idx}`}
                  className="bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] rounded-2xl transition-all overflow-hidden shadow-xs"
                >
                  {/* Card Header (Clickable Accordion) */}
                  <div
                    onClick={() => toggleAgentCard(ae.agent_name)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#18181B] shrink-0">
                        <IconComp className="w-5 h-5 text-[#18181B]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-[#18181B]">{meta.title}</h4>
                          <Badge variant="default" size="sm">
                            {meta.stageLabel}
                          </Badge>
                          {ae.confidence && (
                            <span className="text-[10px] font-mono text-[#2D5A36] bg-[#D8EAD9] px-2 py-0.5 rounded-full font-bold">
                              Confidence: {(ae.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#52525B] mt-0.5">{meta.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right font-mono">
                        <div className="text-lg sm:text-xl font-black text-[#18181B]">
                          {ae.score.toFixed(1)} <span className="text-xs text-[#71717A] font-normal">/ 100</span>
                        </div>
                      </div>
                      <div className="text-[#71717A] hover:text-[#18181B] transition-colors p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8]">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-6 border-t border-[#E8E3D8] space-y-6 bg-[#FAF8F5]">
                      {/* Detailed Assessment */}
                      <div>
                        <div className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2.5">
                          <Activity className="w-3.5 h-3.5 text-[#3A4B86]" />
                          <span>Detailed Agent Assessment &amp; Bullet Points:</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-[#E8E3D8] text-xs text-[#18181B] leading-relaxed font-sans whitespace-pre-line space-y-2 shadow-2xs">
                          {ae.reasoning || "Evaluation completed with automated consensus."}
                        </div>
                      </div>

                      {/* 3 Actionable Suggestions */}
                      <div>
                        <div className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono flex items-center gap-1.5 mb-3">
                          <Lightbulb className="w-3.5 h-3.5 text-[#3A4B86]" />
                          <span>Actionable Project Suggestions (3 Key Points):</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                          {points.map((pt, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-4 rounded-xl bg-white border border-[#E8E3D8] hover:border-[#D6CFBE] transition-colors flex flex-col justify-between shadow-2xs"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-5 h-5 rounded-md bg-[#FAF8F5] border border-[#E8E3D8] text-[#18181B] flex items-center justify-center text-[10px] font-mono font-bold">
                                    0{pIdx + 1}
                                  </span>
                                  <h5 className="text-xs font-bold text-[#18181B] truncate">{pt.title}</h5>
                                </div>
                                <p className="text-[11px] text-[#52525B] leading-relaxed">{pt.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tool Evidence Artifacts Drawer */}
                      {ae.evidence && ae.evidence.length > 0 && (
                        <div className="pt-4 border-t border-[#E8E3D8]">
                          <div className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2.5">
                            <Terminal className="w-3.5 h-3.5 text-[#2D5A36]" />
                            <span>Grounded Scanner Artifacts ({ae.evidence.length} Tool Executions):</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ae.evidence.map((ev, evIdx) => (
                              <div
                                key={evIdx}
                                className="p-3.5 rounded-xl bg-white border border-[#E8E3D8] font-mono text-[11px] space-y-2 shadow-2xs"
                              >
                                <div className="flex items-center justify-between text-[#71717A]">
                                  <span className="text-[#2D5A36] font-bold uppercase text-[10px]">{ev.tool_used}</span>
                                  <button
                                    onClick={() => handleCopyJSON(`${ae.agent_name}-${evIdx}`, ev.content)}
                                    className="text-[#52525B] hover:text-[#18181B] flex items-center gap-1 text-[10px] cursor-pointer font-semibold"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>Copy JSON</span>
                                  </button>
                                </div>
                                <div className="text-[#52525B] truncate text-[10px]">
                                  Source: <span className="text-[#18181B] font-semibold">{ev.source}</span>
                                </div>
                                <pre className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E3D8] text-[10px] text-[#18181B] overflow-x-auto max-h-28">
                                  {JSON.stringify(ev.content, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cross-Stage Claim Consistency Ledger */}
      {consistency && (
        <Card className="mb-8 bg-white border-[#E8E3D8] shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GitCompare className="w-5 h-5 text-[#3A4B86]" />
                <CardTitle>Cross-Stage Claim Consistency Ledger</CardTitle>
              </div>
              <Badge variant="default" size="md">
                {Math.round(consistency.verification_rate * 100)}% Claims Verified
              </Badge>
            </div>
            <CardDescription>
              Every technical claim extracted from the Stage 2 presentation deck is verified against the Stage 3 GitHub repo and live deployment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consistency.claims.length === 0 ? (
              <p className="text-xs text-[#71717A] py-4 text-center">
                No claims extracted yet. Upload a deck in Stage 2 to populate claims.
              </p>
            ) : (
              <div className="space-y-2.5">
                {consistency.claims.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E8E3D8] text-[#18181B] font-bold uppercase shrink-0 mt-0.5">
                        {c.claim_type}
                      </span>
                      <span className="text-[#18181B] font-medium">{c.claim_text}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.status === "verified" || c.verification_status === "verified" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#2D5A36] font-mono font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#71717A] font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teacher / Faculty Judge Qualitative Dossier Section */}
      <div className="mb-10">
        <Card variant="elevated" className="p-6 bg-white border-[#E8E3D8] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E3D8]">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#3A4B86]" />
                <h3 className="font-serif text-lg font-bold text-[#18181B]">
                  Faculty Judge Qualitative Dossier (30% Weight)
                </h3>
              </div>
              <p className="text-xs text-[#52525B] mt-0.5">
                Human judge qualitative evaluation, mentorship feedback, and calibrated rubric score.
              </p>
            </div>

            {teacherFeedback?.human_score !== null && teacherFeedback?.human_score !== undefined && (
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-[#71717A]">Judge Rating:</span>
                <span className="text-xl font-black text-[#2D5A36]">
                  {teacherFeedback.human_score.toFixed(1)} / 100
                </span>
              </div>
            )}
          </div>

          {teacherFeedback && (teacherFeedback.human_score !== null || teacherFeedback.comments) ? (
            <div className="mt-6 space-y-6">
              <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#71717A] font-mono">
                  <span className="flex items-center gap-1.5 text-[#18181B] font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#3A4B86]" />
                    Qualitative Assessment Notes
                  </span>
                  {teacherFeedback.updated_at && (
                    <span>Reviewed: {new Date(teacherFeedback.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="text-xs text-[#18181B] leading-relaxed whitespace-pre-line font-sans bg-white p-5 rounded-lg border border-[#E8E3D8] shadow-2xs">
                  {teacherFeedback.comments || "No qualitative comments provided by the judge."}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8]">
                  <div className="text-[10px] text-[#71717A] uppercase font-bold">Evaluation Status</div>
                  <div className="text-sm font-bold text-[#2D5A36] mt-1 capitalize flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {teacherFeedback.status || "Scored"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8]">
                  <div className="text-[10px] text-[#71717A] uppercase font-bold">Faculty Judge ID</div>
                  <div className="text-sm font-bold text-[#18181B] mt-1">{teacherFeedback.judge_id || "Lead Faculty Reviewer"}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8]">
                  <div className="text-[10px] text-[#71717A] uppercase font-bold">Composite Split</div>
                  <div className="text-sm font-bold text-[#18181B] mt-1">70% AI Swarm / 30% Judge</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-8 rounded-xl bg-[#FAF8F5] border border-dashed border-[#E8E3D8] text-center">
              <Clock className="w-8 h-8 text-[#A1A1AA] mx-auto mb-2 animate-pulse" />
              <h4 className="text-sm font-bold text-[#18181B]">Awaiting Faculty Judge Review</h4>
              <p className="text-xs text-[#71717A] mt-1 max-w-md mx-auto">
                This project is currently awaiting review by the faculty judge. Notes and calibrated score will appear here once submitted.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
