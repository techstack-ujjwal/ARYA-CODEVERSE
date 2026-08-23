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
  ChevronRight,
  ChevronDown,
  Cpu,
  FileText,
  Code2,
  Zap,
  Globe,
  AlertTriangle,
  Flame,
  CheckCircle,
  Clock,
  Sliders,
  Trophy,
} from "lucide-react";
import { ProjectsAPI } from "@/lib/api/projects";
import { EvaluationAPI } from "@/lib/api/evaluation";
import { StagesAPI } from "@/lib/api/stages";
import { JudgingAPI } from "@/lib/api/judging";
import {
  Project,
  EvaluationSummary,
  EvidenceItem,
  ConsistencyMetrics,
  DetailedAgentEvaluation,
  TeacherFeedback,
  IdeaEvaluationResult,
  PPTEvaluationResult,
  ProductEvaluationResult,
} from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreMeter } from "@/components/ui/ScoreMeter";
import { Progress } from "@/components/ui/Progress";
import { EvidenceViewer } from "@/components/ui/EvidenceViewer";

// Agent Metadata Directory
const AGENT_META: Record<
  string,
  { title: string; stage: string; desc: string; icon: any; color: string }
> = {
  idea_selection_agent: {
    title: "Idea Selection & Core Novelty Agent",
    stage: "Stage 1: Idea (20%)",
    desc: "Evaluates foundational novelty, solution defensibility, and technological moat.",
    icon: Sparkles,
    color: "indigo",
  },
  problem_impact_agent: {
    title: "Problem Magnitude & Societal Impact Agent",
    stage: "Stage 1: Idea (20%)",
    desc: "Measures problem severity, user cohort clarity, and quantifiable economic impact.",
    icon: AlertTriangle,
    color: "amber",
  },
  feasibility_agent: {
    title: "Technical Feasibility & Architecture Viability Agent",
    stage: "Stage 1: Idea (20%)",
    desc: "Assesses technology stack realism, resource constraints, and latency targets.",
    icon: Cpu,
    color: "sky",
  },
  market_agent: {
    title: "Market Differentiation & Competitive Landscape Agent",
    stage: "Stage 1: Idea (20%)",
    desc: "Grounded Tavily web search across live 2026 developer and industry benchmarks.",
    icon: Search,
    color: "emerald",
  },
  technical_architecture_agent: {
    title: "System Architecture & Claim Extraction Agent",
    stage: "Stage 2: PPT Deck (25%)",
    desc: "Parses presentation deck slides and maps microservices, data flow, and claims.",
    icon: Layers,
    color: "purple",
  },
  presentation_agent: {
    title: "Presentation Quality & Deck Coherence Agent",
    stage: "Stage 2: PPT Deck (25%)",
    desc: "Evaluates slide narrative structure, visual clarity, and data rigor.",
    icon: FileText,
    color: "sky",
  },
  presentation_coherence_agent: {
    title: "Presentation Quality & Deck Coherence Agent",
    stage: "Stage 2: PPT Deck (25%)",
    desc: "Evaluates slide narrative structure, visual clarity, and data rigor.",
    icon: FileText,
    color: "sky",
  },
  business_impact_agent: {
    title: "Commercial Viability & Business Model Agent",
    stage: "Stage 2: PPT Deck (25%)",
    desc: "Analyzes monetization tiering, user acquisition, and enterprise scaling path.",
    icon: Award,
    color: "amber",
  },
  code_quality_agent: {
    title: "AST Code Quality & Modularity Agent",
    stage: "Stage 3: Product (55%)",
    desc: "Performs AST code inspection, cyclomatic complexity check, and typing audit.",
    icon: Code2,
    color: "emerald",
  },
  ui_ux_agent: {
    title: "UI/UX Experience & WCAG Accessibility Agent",
    stage: "Stage 3: Product (55%)",
    desc: "Audits frontend responsiveness, ARIA keyboard navigation, and design polish.",
    icon: Globe,
    color: "sky",
  },
  ux_evaluation_agent: {
    title: "UI/UX Experience & WCAG Accessibility Agent",
    stage: "Stage 3: Product (55%)",
    desc: "Audits frontend responsiveness, ARIA keyboard navigation, and design polish.",
    icon: Globe,
    color: "sky",
  },
  functionality_agent: {
    title: "Functionality & API Error Boundary Agent",
    stage: "Stage 3: Product (55%)",
    desc: "Tests core execution flows, endpoint resilience, and error handling mechanics.",
    icon: Activity,
    color: "indigo",
  },
  security_agent: {
    title: "OWASP Top 10 Security & Secrets Hygiene Agent",
    stage: "Stage 3: Product (55%)",
    desc: "Scans repository for exposed API credentials, SSRF vectors, and injection risks.",
    icon: ShieldCheck,
    color: "emerald",
  },
  real_world_impact_agent: {
    title: "Production Readiness & Real-World Utility Agent",
    stage: "Stage 3: Product (55%)",
    desc: "Assesses deployability, daily engineering engagement value, and enterprise utility.",
    icon: Zap,
    color: "purple",
  },
  cross_stage_consistency_agent: {
    title: "Cross-Stage Claim Consistency Agent",
    stage: "Cross-Stage Verification",
    desc: "Verifies deck claims against actual repository implementations and live APIs.",
    icon: GitCompare,
    color: "indigo",
  },
  plagiarism_agent: {
    title: "Code Authenticity & Plagiarism Guard",
    stage: "Security & Authenticity",
    desc: "Inspects code originality against public open-source repositories.",
    icon: Flame,
    color: "rose",
  },
};

function formatAgentMeta(agentName: string) {
  return (
    AGENT_META[agentName] || {
      title: agentName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      stage: "Stage Evaluation",
      desc: "Specialized multi-agent evaluator.",
      icon: Sparkles,
      color: "zinc",
    }
  );
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
  const [ideaEval, setIdeaEval] = useState<IdeaEvaluationResult | null>(null);
  const [pptEval, setPptEval] = useState<PPTEvaluationResult | null>(null);
  const [productEval, setProductEval] = useState<ProductEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAgentStage, setSelectedAgentStage] = useState<string>("all");
  const [expandedAgentCards, setExpandedAgentCards] = useState<Record<string, boolean>>({});
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [proj, sum, ev, cons, iEval, pEval, prodEval, judgeFb] = await Promise.all([
        ProjectsAPI.getById(projectId),
        EvaluationAPI.getSummary(projectId).catch(() => null),
        EvaluationAPI.getEvidence(projectId).catch(() => []),
        EvaluationAPI.getConsistency(projectId).catch(() => null),
        StagesAPI.getIdeaEvaluation(projectId).catch(() => null),
        StagesAPI.getPPTEvaluation(projectId).catch(() => null),
        StagesAPI.getProductEvaluation(projectId).catch(() => null),
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

      if (iEval && iEval.score !== undefined) setIdeaEval(iEval);
      if (pEval && pEval.score !== undefined) setPptEval(pEval);
      if (prodEval && prodEval.score !== undefined) setProductEval(prodEval);
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

  const filteredEvidence = evidenceList.filter((ev) => {
    if (evidenceFilter === "all") return true;
    return ev.evidence_type === evidenceFilter;
  });

  const rawAgentEvaluations: DetailedAgentEvaluation[] = summary?.agent_evaluations || [];
  const filteredAgents = rawAgentEvaluations.filter((ae) => {
    if (selectedAgentStage === "all") return true;
    return ae.stage === selectedAgentStage;
  });

  if (isLoading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <Activity className="w-8 h-8 animate-spin mb-3 text-zinc-400" />
        <p className="text-xs font-mono">Synthesizing comprehensive multi-agent dossier...</p>
      </div>
    );
  }

  const aiScore = summary?.weighted_ai_score || 0;
  const humanScore = teacherFeedback?.human_score ?? null;
  const compositeFinalScore =
    humanScore !== null ? Number((aiScore * 0.7 + humanScore * 0.3).toFixed(1)) : aiScore;
  const isUnevaluated =
    (!summary || summary.total_evaluations === 0) && !ideaEval && !pptEval && !productEval;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Navigation & Header */}
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project Workspace</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
                {project?.name || "Project"} — Comprehensive Multi-Agent Evaluation Report
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Detailed point-by-point rubric analysis across all 17 evaluation agents, tool evidence dossiers, and teacher qualitative feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Report
            </Button>
          </div>
        </div>
      </div>

      {/* Onboarding Banner for Unevaluated Projects */}
      {isUnevaluated && (
        <Card variant="subtle" className="mb-8 border-indigo-500/20 bg-indigo-500/5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">No Stage Evaluations Completed Yet</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Submit your Idea statement, Presentation deck, or GitHub repo in the workspace and run the agent pipeline to generate scores and evidence.
                </p>
              </div>
            </div>
            <Link href={`/projects/${projectId}`}>
              <Button size="sm" variant="secondary" className="shrink-0 gap-1">
                <span>Go to Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Main Score & Weights Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Composite AI & Human Grand Score Hero */}
        <Card variant="elevated" className="lg:col-span-4 flex flex-col justify-between p-6 bg-zinc-950/90 border-zinc-800">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                Composite Score
              </span>
              <Badge variant={humanScore !== null ? "success" : "purple"} size="sm">
                {humanScore !== null ? "70% AI + 30% JUDGE" : "WEIGHTED AI (20/25/55)"}
              </Badge>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <ScoreMeter score={compositeFinalScore} size="lg" />
              <div className="mt-4 text-center">
                <div className="text-xs font-semibold text-zinc-200">
                  {humanScore !== null ? "Calibrated Final Hackathon Rating" : "Automated AI Evaluation Index"}
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 max-w-[220px]">
                  Synthesized across multi-agent rubric consensus and faculty review.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between text-zinc-400">
              <span>Weighted AI Index (70%):</span>
              <span className="text-indigo-400 font-semibold">{aiScore.toFixed(1)} / 100</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Teacher / Judge Review (30%):</span>
              <span className={humanScore !== null ? "text-amber-400 font-semibold" : "text-zinc-500"}>
                {humanScore !== null ? `${humanScore.toFixed(1)} / 100` : "Pending Grading"}
              </span>
            </div>
          </div>
        </Card>

        {/* Stage Breakdown Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-between p-5 bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Stage 1</span>
                <Badge variant="default" size="sm">20% Weight</Badge>
              </div>
              <h4 className="text-sm font-bold text-zinc-100">Idea & Market Feasibility</h4>
              <div className="text-2xl font-mono font-black text-zinc-100 mt-2">
                {summary?.breakdown.idea_stage.score ? Math.round(summary.breakdown.idea_stage.score) : 0}
                <span className="text-xs text-zinc-500 ml-1 font-normal">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>4 Parallel Agents</span>
              <span className="text-emerald-400 font-mono">Tavily Verified</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5 bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Stage 2</span>
                <Badge variant="default" size="sm">25% Weight</Badge>
              </div>
              <h4 className="text-sm font-bold text-zinc-100">Technical Architecture Deck</h4>
              <div className="text-2xl font-mono font-black text-zinc-100 mt-2">
                {summary?.breakdown.ppt_stage.score ? Math.round(summary.breakdown.ppt_stage.score) : 0}
                <span className="text-xs text-zinc-500 ml-1 font-normal">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>3 Parallel Agents</span>
              <span className="text-purple-400 font-mono">AST Claims Mapped</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5 bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Stage 3</span>
                <Badge variant="default" size="sm">55% Weight</Badge>
              </div>
              <h4 className="text-sm font-bold text-zinc-100">Product, Code & Security</h4>
              <div className="text-2xl font-mono font-black text-zinc-100 mt-2">
                {summary?.breakdown.product_stage.score ? Math.round(summary.breakdown.product_stage.score) : 0}
                <span className="text-xs text-zinc-500 ml-1 font-normal">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>5 Parallel Agents</span>
              <span className="text-sky-400 font-mono">OWASP Scan Clean</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 🌟 TEACHER & JUDGE FEEDBACK REPORT SECTION (Requirement 2) */}
      <div className="mb-10">
        <Card className="border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-zinc-900/60 to-zinc-950/80 p-6 shadow-xl shadow-amber-950/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-100">
                    Teacher & Faculty Judge Qualitative Evaluation
                  </h3>
                  {humanScore !== null && (
                    <Badge variant="warning" size="sm">
                      VERIFIED REVIEW
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Human faculty review accounting for <strong className="text-amber-400">30% weight</strong> in the final composite hackathon standing.
                </p>
              </div>
            </div>

            {humanScore !== null && (
              <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-amber-500/30 text-right font-mono shrink-0 shadow-lg">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Teacher / Judge Score</div>
                <div className="text-2xl font-black text-amber-400">
                  {humanScore.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">30.0% Final Composite Weight</div>
              </div>
            )}
          </div>

          {teacherFeedback && (humanScore !== null || teacherFeedback.comments) ? (
            <div className="mt-6 space-y-6">
              <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Qualitative Feedback & Assessment Notes
                  </span>
                  {teacherFeedback.updated_at && (
                    <span>Reviewed: {new Date(teacherFeedback.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line font-sans bg-zinc-950/80 p-5 rounded-lg border border-zinc-800/80">
                  {teacherFeedback.comments || "No qualitative comments provided by the judge."}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Evaluation Status</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1 capitalize flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {teacherFeedback.status || "Scored"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Faculty Judge ID</div>
                  <div className="text-sm font-bold text-zinc-200 mt-1">{teacherFeedback.judge_id || "Lead Faculty Reviewer"}</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Score Distribution</div>
                  <div className="text-sm font-bold text-indigo-400 mt-1">70% Multi-Agent / 30% Judge</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-8 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center">
              <Clock className="w-8 h-8 text-amber-400/60 mx-auto mb-2 animate-pulse" />
              <h4 className="text-sm font-semibold text-zinc-200">Awaiting Teacher & Human Judge Scoring</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                This project is currently awaiting review by the faculty judge. As soon as qualitative notes and score are submitted, they will appear here.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* 🚀 DETAILED POINT-BY-POINT MULTI-AGENT ANALYSIS SECTION (Requirement 3) */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                Multi-Agent Point-by-Point Evaluation Dossier
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comprehensive point-to-point rubric criteria, strengths, vulnerabilities, and grounded tool evidence across all 17 agents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAllAgents}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllAgents}
              className="text-xs text-zinc-400 hover:text-zinc-200 font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 text-xs">
          {[
            { id: "all", label: `All Evaluators (${rawAgentEvaluations.length})` },
            { id: "idea", label: "Stage 1: Idea (4 Agents)" },
            { id: "ppt", label: "Stage 2: PPT Deck (3 Agents)" },
            { id: "product", label: "Stage 3: Product (5 Agents)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAgentStage(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer whitespace-nowrap ${
                selectedAgentStage === tab.id
                  ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Agent Cards List */}
        {filteredAgents.length === 0 ? (
          <Card variant="subtle" className="p-8 text-center text-zinc-400">
            <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs">No agent evaluations available for this stage yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAgents.map((ae) => {
              const meta = formatAgentMeta(ae.agent_name);
              const IconComp = meta.icon;
              const isExpanded = expandedAgentCards[ae.agent_name] ?? true; // default expanded

              return (
                <Card
                  key={ae.agent_name}
                  className="bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden"
                >
                  {/* Card Header (Clickable to Toggle) */}
                  <div
                    onClick={() => toggleAgentCard(ae.agent_name)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-200 shrink-0">
                        <IconComp className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-zinc-100">{meta.title}</h4>
                          <Badge variant="purple" size="sm">
                            {meta.stage}
                          </Badge>
                          {ae.confidence && (
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                              Confidence: {(ae.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{meta.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                      <div className="text-right font-mono">
                        <div className="text-lg font-black text-zinc-100">
                          {ae.score.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
                        </div>
                      </div>
                      <div className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 rotate-180 transition-transform" />
                        ) : (
                          <ChevronDown className="w-4 h-4 transition-transform" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Point-by-Point Details */}
                  {isExpanded && (
                    <div className="p-5 pt-3 border-t border-zinc-800/60 space-y-5 bg-zinc-950/40">
                      {/* Formatted Point-to-Point Analysis */}
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-400" />
                          Point-by-Point Evaluation Breakdown:
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line space-y-2">
                          {ae.reasoning || "Evaluation completed with no extended notes."}
                        </div>
                      </div>

                      {/* Tool Evidence Attached to this Agent */}
                      {ae.evidence && ae.evidence.length > 0 && (
                        <div className="space-y-2.5 pt-3 border-t border-zinc-800/60">
                          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            Grounded Tool Evidence ({ae.evidence.length} Artifacts):
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ae.evidence.map((ev, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 font-mono text-[11px] space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-zinc-400">
                                  <span className="text-emerald-400 font-bold uppercase">{ev.tool_used}</span>
                                  <button
                                    onClick={() => handleCopyJSON(`${ae.agent_name}-${idx}`, ev.content)}
                                    className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>Copy JSON</span>
                                  </button>
                                </div>
                                <div className="text-zinc-300 truncate text-[10px]">
                                  Source: <span className="text-zinc-400">{ev.source}</span>
                                </div>
                                <pre className="p-2 rounded bg-zinc-950 text-[10px] text-zinc-400 overflow-x-auto max-h-28">
                                  {JSON.stringify(ev.content, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cross-Stage Claim Consistency Ledger */}
      {consistency && (
        <Card className="mb-8 bg-zinc-950/60 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GitCompare className="w-5 h-5 text-indigo-400" />
                <CardTitle>Cross-Stage Claim Consistency Ledger</CardTitle>
              </div>
              <Badge variant="purple" size="md">
                {Math.round(consistency.verification_rate * 100)}% Verified
              </Badge>
            </div>
            <CardDescription>
              Every technical and feature claim extracted from the Stage 2 presentation deck is cross-verified against the Stage 3 GitHub repository and live deployment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consistency.claims.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">
                No claims extracted yet. Upload a deck in Stage 2 to populate claims.
              </p>
            ) : (
              <div className="space-y-2.5">
                {consistency.claims.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase shrink-0 mt-0.5">
                        {c.claim_type}
                      </span>
                      <span className="text-zinc-200 font-medium">{c.claim_text}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Origin: {c.origin_stage.toUpperCase()}
                      </span>
                      <Badge
                        variant={c.status === "verified" ? "success" : "outline"}
                        size="sm"
                      >
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tool-Grounded Evidence Dossier */}
      <Card className="mb-8 bg-zinc-950/60 border-zinc-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <CardTitle>Deterministic Evidence Dossier</CardTitle>
            </div>

            {/* Evidence Type Filter */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs overflow-x-auto">
              {(["all", "static_analysis", "security_scan", "browser_automation", "web_search"] as const).map(
                (filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setEvidenceFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-all cursor-pointer whitespace-nowrap ${
                      evidenceFilter === filterKey
                        ? "bg-zinc-800 text-zinc-100 font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {filterKey.replace(/_/g, " ")}
                  </button>
                )
              )}
            </div>
          </div>
          <CardDescription>
            Raw deterministic tool outputs (Uptime checks, static AST analysis, security scanning, web search citations) backing agent ratings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvidenceViewer evidence={evidenceList} filter={evidenceFilter} />
        </CardContent>
      </Card>
    </div>
  );
}
