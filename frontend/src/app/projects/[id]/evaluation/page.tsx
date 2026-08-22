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
} from "lucide-react";
import { ProjectsAPI } from "@/lib/api/projects";
import { EvaluationAPI } from "@/lib/api/evaluation";
import { StagesAPI } from "@/lib/api/stages";
import {
  Project,
  EvaluationSummary,
  EvidenceItem,
  ConsistencyMetrics,
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
  const [ideaEval, setIdeaEval] = useState<IdeaEvaluationResult | null>(null);
  const [pptEval, setPptEval] = useState<PPTEvaluationResult | null>(null);
  const [productEval, setProductEval] = useState<ProductEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [proj, sum, ev, cons, iEval, pEval, prodEval] = await Promise.all([
        ProjectsAPI.getById(projectId),
        EvaluationAPI.getSummary(projectId).catch(() => null),
        EvaluationAPI.getEvidence(projectId).catch(() => []),
        EvaluationAPI.getConsistency(projectId).catch(() => null),
        StagesAPI.getIdeaEvaluation(projectId).catch(() => null),
        StagesAPI.getPPTEvaluation(projectId).catch(() => null),
        StagesAPI.getProductEvaluation(projectId).catch(() => null),
      ]);

      setProject(proj);
      setSummary(sum);
      setEvidenceList(ev);
      setConsistency(cons);
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

  if (isLoading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <Activity className="w-8 h-8 animate-spin mb-3 text-zinc-400" />
        <p className="text-xs font-mono">Synthesizing multi-agent dossier...</p>
      </div>
    );
  }

  const aiScore = summary?.weighted_ai_score || 0;
  const isUnevaluated = (!summary || summary.total_evaluations === 0) && !ideaEval && !pptEval && !productEval;

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
                {project?.name || "Project"} — Evaluation Audit Matrix
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Complete multi-agent verification ledger, tool-grounded evidence citations, and cross-stage consistency report.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Audit
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
        {/* Composite AI Score Hero */}
        <Card variant="elevated" className="lg:col-span-4 flex flex-col justify-between p-6 bg-zinc-950/80">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Overall AI Score
              </span>
              <Badge variant="purple" size="sm">
                WEIGHTED (20/25/55)
              </Badge>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <ScoreMeter score={aiScore} size="lg" />
              <p className="text-xs text-zinc-400 mt-4 text-center max-w-[200px]">
                Grounded composite calculated across all evaluated stages.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-500 flex justify-between">
            <span>Formula:</span>
            <span className="text-zinc-300">0.20·Idea + 0.25·PPT + 0.55·Prod</span>
          </div>
        </Card>

        {/* Stage Breakdown Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-between p-4 bg-zinc-900/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Stage 1</span>
                <Badge variant="default" size="sm">20% Weight</Badge>
              </div>
              <h4 className="text-sm font-semibold text-zinc-100">Idea & Market</h4>
              <div className="text-2xl font-mono font-bold text-zinc-100 mt-2">
                {summary?.breakdown.idea_stage.score ? Math.round(summary.breakdown.idea_stage.score) : 0}
                <span className="text-xs text-zinc-500 ml-1">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500">
              4 Parallel Agents + Tavily
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-zinc-900/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Stage 2</span>
                <Badge variant="default" size="sm">25% Weight</Badge>
              </div>
              <h4 className="text-sm font-semibold text-zinc-100">Architecture Deck</h4>
              <div className="text-2xl font-mono font-bold text-zinc-100 mt-2">
                {summary?.breakdown.ppt_stage.score ? Math.round(summary.breakdown.ppt_stage.score) : 0}
                <span className="text-xs text-zinc-500 ml-1">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500">
              3 Agents + PDF Claim Extractor
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 bg-zinc-900/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Stage 3</span>
                <Badge variant="default" size="sm">55% Weight</Badge>
              </div>
              <h4 className="text-sm font-semibold text-zinc-100">Product & Code</h4>
              <div className="text-2xl font-mono font-bold text-zinc-100 mt-2">
                {summary?.breakdown.product_stage.score ? Math.round(summary.breakdown.product_stage.score) : 0}
                <span className="text-xs text-zinc-500 ml-1">/100</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500">
              5 Agents + Security/Uptime Tools
            </div>
          </Card>
        </div>
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
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
              {(["all", "static_analysis", "security_scan", "browser_automation", "web_search"] as const).map(
                (filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setEvidenceFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-all cursor-pointer ${
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
          {filteredEvidence.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              No evidence artifacts found for this filter. Run stage evaluations in the workspace.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 font-mono text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple" size="sm">
                        {ev.tool_used}
                      </Badge>
                      <span className="text-zinc-400 text-[11px]">{ev.source}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {ev.evidence_type}
                      </Badge>
                      <button
                        onClick={() => handleCopyJSON(ev.id, ev.content)}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        title="Copy JSON to clipboard"
                      >
                        {copiedId === ev.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-300 overflow-x-auto max-h-60 overflow-y-auto">
                    {JSON.stringify(ev.content, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
