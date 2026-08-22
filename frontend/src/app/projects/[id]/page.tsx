"use client";

import React, { useEffect, useState, use, DragEvent } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowLeft,
  Globe,
  UploadCloud,
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
  Activity,
  Terminal,
  RefreshCw,
  AlertCircle,
  FileCode2,
  Code2,
  Compass,
  Cpu,
  Wand2,
  Check,
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { ProjectsAPI } from "@/lib/api/projects";
import { StagesAPI } from "@/lib/api/stages";
import { FeedbackAPI } from "@/lib/api/feedback";
import {
  Project,
  ProjectStatus,
  IdeaEvaluationResult,
  PPTEvaluationResult,
  ProductEvaluationResult,
  ExtractedClaim,
  FeedbackReportData,
} from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ScoreMeter } from "@/components/ui/ScoreMeter";
import { Progress } from "@/components/ui/Progress";

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const { toast, success, error } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<ProjectStatus | null>(null);
  const [activeTab, setActiveTab] = useState<string>("idea");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Stage 1: Idea State
  const [ideaForm, setIdeaForm] = useState({
    problem_statement: "",
    proposed_solution: "",
    target_audience: "",
    uniqueness: "",
  });
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  const [isEvaluatingIdea, setIsEvaluatingIdea] = useState(false);
  const [ideaEval, setIdeaEval] = useState<IdeaEvaluationResult | null>(null);

  // Stage 2: PPT State
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingPPT, setIsUploadingPPT] = useState(false);
  const [isEvaluatingPPT, setIsEvaluatingPPT] = useState(false);
  const [pptEval, setPptEval] = useState<PPTEvaluationResult | null>(null);
  const [pptClaims, setPptClaims] = useState<ExtractedClaim[]>([]);

  // Stage 3: Product State
  const [productForm, setProductForm] = useState({
    github_url: "",
    live_url: "",
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isEvaluatingProduct, setIsEvaluatingProduct] = useState(false);
  const [productEval, setProductEval] = useState<ProductEvaluationResult | null>(null);

  // Instant Feedback State
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState<FeedbackReportData | null>(null);

  const calculateTotalWords = (obj: Record<string, string>) => {
    return Object.values(obj).reduce((acc, str) => {
      if (!str) return acc;
      return acc + str.trim().split(/\s+/).filter(Boolean).length;
    }, 0);
  };

  const totalIdeaWords = calculateTotalWords(ideaForm);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [projData, statusData] = await Promise.all([
        ProjectsAPI.getById(projectId),
        ProjectsAPI.getStatus(projectId).catch(() => null),
      ]);
      setProject(projData);
      setPipelineStatus(statusData);

      if (projData) {
        setProductForm({
          github_url: projData.github_url || "",
          live_url: projData.live_url || "",
        });
      }

      // Parallel fetch of prior stage data
      const [iEval, pEval, claims, prodEval, fbData, ideaSub] = await Promise.all([
        StagesAPI.getIdeaEvaluation(projectId).catch(() => null),
        StagesAPI.getPPTEvaluation(projectId).catch(() => null),
        StagesAPI.getPPTClaims(projectId).catch(() => []),
        StagesAPI.getProductEvaluation(projectId).catch(() => null),
        FeedbackAPI.getLatest(projectId).catch(() => null),
        StagesAPI.getIdeaSubmission(projectId).catch(() => null),
      ]);

      if (ideaSub && (ideaSub.problem_statement || ideaSub.proposed_solution)) {
        setIdeaForm({
          problem_statement: ideaSub.problem_statement || "",
          proposed_solution: ideaSub.proposed_solution || "",
          target_audience: ideaSub.target_audience || "",
          uniqueness: ideaSub.uniqueness || "",
        });
      }

      if (iEval && iEval.score !== undefined) setIdeaEval(iEval);
      if (pEval && pEval.score !== undefined) setPptEval(pEval);
      if (claims) setPptClaims(claims);
      if (prodEval && prodEval.score !== undefined) setProductEval(prodEval);
      if (fbData && fbData.overall_health) setFeedbackReport(fbData);
    } catch (err: any) {
      setLoadError(err.message || "Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [projectId]);

  // Demo Helpers
  const handleFillDemoIdea = () => {
    setIdeaForm({
      problem_statement:
        "Student mental health screening in universities lacks real-time early warning signals, leading to delayed interventions and poor outcomes during high-stress academic periods.",
      proposed_solution:
        "MindScope uses ambient behavioral signals from campus LMS activity and opt-in wearable data to generate early risk alerts using privacy-preserving federated learning — no raw student data leaves the device.",
      target_audience:
        "University counseling centers, student wellness programs, and campus health administrators managing large student populations.",
      uniqueness:
        "First federated approach to campus mental health screening — 5x earlier detection than periodic survey-based methods, with full FERPA compliance and on-device inference.",
    });
    toast("Pre-filled sample Stage 1 Idea data", "info");
  };

  const handleFillDemoProduct = () => {
    setProductForm({
      github_url: "https://github.com/techstack-ujjwal/ARYA-CODEVERSE",
      live_url: "https://eval-engine-demo.vercel.app",
    });
    toast("Pre-filled sample GitHub repo and live URL", "info");
  };

  // Stage 1 Handlers
  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalIdeaWords > 500) {
      error("Idea submission exceeds 500 word limit");
      return;
    }

    try {
      setIsSubmittingIdea(true);
      await StagesAPI.submitIdea(projectId, ideaForm);
      success("Stage 1 Idea statement submitted successfully");
      loadAllData();
    } catch (err: any) {
      error(err.message || "Failed to submit idea");
    } finally {
      setIsSubmittingIdea(false);
    }
  };

  const handleEvaluateIdea = async () => {
    try {
      setIsEvaluatingIdea(true);
      await StagesAPI.evaluateIdea(projectId);
      success("4-agent parallel evaluation queued! Refreshing in a few seconds...");
      setTimeout(loadAllData, 3500);
    } catch (err: any) {
      error(err.message || "Failed to trigger idea evaluation");
    } finally {
      setIsEvaluatingIdea(false);
    }
  };

  // Stage 2 Handlers (Drag and Drop + File Validation)
  const validateAndSetFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      error("Only PDF files are supported for presentation decks");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      error("PDF file exceeds the maximum 10MB limit");
      return;
    }
    setPptFile(file);
    toast(`Selected ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, "info");
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadPPT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pptFile) {
      error("Please select a PDF presentation file");
      return;
    }

    try {
      setIsUploadingPPT(true);
      const res = await StagesAPI.uploadPPT(projectId, pptFile);
      success(`Presentation uploaded (${res.total_pages} slides parsed)`);
      loadAllData();
    } catch (err: any) {
      error(err.message || "Failed to upload PPT deck");
    } finally {
      setIsUploadingPPT(false);
    }
  };

  const handleEvaluatePPT = async () => {
    try {
      setIsEvaluatingPPT(true);
      await StagesAPI.evaluatePPT(projectId);
      success("3-agent PPT evaluation queued! Parsing claims...");
      setTimeout(loadAllData, 3500);
    } catch (err: any) {
      error(err.message || "Failed to trigger PPT evaluation");
    } finally {
      setIsEvaluatingPPT(false);
    }
  };

  // Stage 3 Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProduct(true);
      await StagesAPI.registerProduct(projectId, productForm);
      success("Repository & live deployment registered");
      loadAllData();
    } catch (err: any) {
      error(err.message || "Failed to register product links");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleEvaluateProduct = async () => {
    try {
      setIsEvaluatingProduct(true);
      await StagesAPI.evaluateProduct(projectId);
      success("5-agent product evaluation pipeline queued!");
      setTimeout(loadAllData, 4000);
    } catch (err: any) {
      error(err.message || "Failed to trigger product evaluation");
    } finally {
      setIsEvaluatingProduct(false);
    }
  };

  // Instant Feedback Handler
  const handleTriggerInstantFeedback = async () => {
    try {
      setIsSubmittingFeedback(true);
      await FeedbackAPI.submit(projectId, {
        github_url: productForm.github_url || project?.github_url || undefined,
        live_url: productForm.live_url || project?.live_url || undefined,
      });
      success("Instant feedback diagnostic complete!");
      loadAllData();
    } catch (err: any) {
      error(err.message || "Failed to run instant diagnostic");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const tabs: TabItem[] = [
    {
      id: "idea",
      label: "Stage 1: Idea (20%)",
      icon: <Compass className="w-4 h-4" />,
      badge: ideaEval?.score ? `${Math.round(ideaEval.score)}pts` : undefined,
    },
    {
      id: "ppt",
      label: "Stage 2: PPT Deck (25%)",
      icon: <FileText className="w-4 h-4" />,
      badge: pptEval?.score ? `${Math.round(pptEval.score)}pts` : undefined,
    },
    {
      id: "product",
      label: "Stage 3: Product (55%)",
      icon: <Code2 className="w-4 h-4" />,
      badge: productEval?.score ? `${Math.round(productEval.score)}pts` : undefined,
    },
    {
      id: "feedback",
      label: "Instant Diagnostics",
      icon: <Zap className="w-4 h-4 text-sky-400" />,
      badge: feedbackReport?.overall_health ? feedbackReport.overall_health.toUpperCase() : undefined,
    },
  ];

  if (isLoading && !project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <Activity className="w-8 h-8 animate-spin mb-3 text-zinc-400" />
        <p className="text-xs font-mono">Loading workspace...</p>
      </div>
    );
  }

  if (!isLoading && !project) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Card variant="subtle" className="border-rose-500/20 bg-rose-500/5 p-8">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-zinc-100">Project Not Found</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-6">
            {loadError || "The project ID you requested does not exist or you do not have permission to access it."}
          </p>
          <Link href="/dashboard">
            <Button size="sm" variant="secondary" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Back Navigation & Workspace Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
                {project?.name || "Project Workspace"}
              </h1>
              <Badge variant={project?.status === "finalized" ? "success" : "purple"} size="md">
                {project?.status?.toUpperCase() || "IDEA"}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              {project?.description || "Structured submission portal and multi-agent evaluation sandbox."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>

            <Link href={`/projects/${projectId}/evaluation`}>
              <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}>
                Audit Matrix & Summary
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stage Stepper Progress Bar */}
      {pipelineStatus && (
        <div className="mb-8 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Pipeline Status:</span>
            <span className="text-zinc-200 font-bold uppercase">{pipelineStatus.overall_status}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(pipelineStatus.stages).map(([stg, state]) => (
              <div key={stg} className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    state === "completed"
                      ? "bg-emerald-400"
                      : state === "submitted" || state === "registered" || state === "generated"
                      ? "bg-amber-400"
                      : "bg-zinc-700"
                  }`}
                />
                <span className="capitalize text-zinc-400">{stg}:</span>
                <span className="text-zinc-200 font-semibold">{state}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Navigation Tabs */}
      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB CONTENT: Stage 1 (Idea) */}
      {activeTab === "idea" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Stage 1: Idea & Feasibility Submission</CardTitle>
                  <button
                    type="button"
                    onClick={handleFillDemoIdea}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Fill Demo Idea</span>
                  </button>
                </div>
                <CardDescription>
                  Describe the core problem, target audience, and uniqueness. Max 500 words total. Evaluated by 4 parallel AI agents + live Tavily web search.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveIdea} className="space-y-4">
                  <Textarea
                    label="Problem Statement *"
                    placeholder="What specific, pressing problem are you solving? Who suffers from it?"
                    value={ideaForm.problem_statement}
                    onChange={(e) =>
                      setIdeaForm({ ...ideaForm, problem_statement: e.target.value })
                    }
                    rows={3}
                  />

                  <Textarea
                    label="Proposed Solution *"
                    placeholder="How does your application address this problem end-to-end?"
                    value={ideaForm.proposed_solution}
                    onChange={(e) =>
                      setIdeaForm({ ...ideaForm, proposed_solution: e.target.value })
                    }
                    rows={3}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Textarea
                      label="Target Audience & Market"
                      placeholder="Who is the primary user? Market segment?"
                      value={ideaForm.target_audience}
                      onChange={(e) =>
                        setIdeaForm({ ...ideaForm, target_audience: e.target.value })
                      }
                      rows={2}
                    />

                    <Textarea
                      label="Key Uniqueness / Moat"
                      placeholder="Why is this 10x better than existing solutions?"
                      value={ideaForm.uniqueness}
                      onChange={(e) =>
                        setIdeaForm({ ...ideaForm, uniqueness: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  {/* Word Count Indicator */}
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-400">Total Word Count Budget</span>
                      <span
                        className={
                          totalIdeaWords > 500
                            ? "text-rose-400 font-bold"
                            : totalIdeaWords > 450
                            ? "text-amber-400 font-semibold"
                            : "text-zinc-300"
                        }
                      >
                        {totalIdeaWords} / 500 words
                      </span>
                    </div>
                    <Progress
                      value={totalIdeaWords}
                      max={500}
                      variant={totalIdeaWords > 500 ? "danger" : totalIdeaWords > 450 ? "warning" : "purple"}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <Button type="submit" size="sm" variant="secondary" isLoading={isSubmittingIdea}>
                      Save Submission
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEvaluateIdea}
                      isLoading={isEvaluatingIdea}
                      leftIcon={<Play className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      Run 4-Agent Evaluation
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {ideaEval ? (
              <Card variant="elevated" className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Stage 1 AI Evaluation
                    </span>
                    <h3 className="text-base font-bold text-zinc-100">Score & Agent Breakdown</h3>
                  </div>
                  <ScoreMeter score={ideaEval.score} size="sm" />
                </div>

                <div className="space-y-3">
                  {Object.entries(ideaEval.agents || {}).map(([agentName, data]) => (
                    <div
                      key={agentName}
                      className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{agentName}</span>
                        <span className="font-mono text-emerald-400 font-bold">{data.score}/100</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-3">
                        {data.reasoning}
                      </p>
                    </div>
                  ))}
                </div>

                {ideaEval.evidence && ideaEval.evidence.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                      Live Web Evidence (Tavily Market Hits):
                    </div>
                    <div className="space-y-1.5">
                      {ideaEval.evidence.slice(0, 3).map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60 text-[11px] text-zinc-300 font-mono truncate"
                        >
                          <span className="text-sky-400 mr-1.5">[{ev.type}]</span>
                          {ev.summary}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card variant="subtle" className="text-center py-12 px-4">
                <Compass className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-zinc-300">No Stage 1 Evaluation Yet</h4>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                  Submit your idea statement and click "Run 4-Agent Evaluation" to trigger the parallel agents.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Stage 2 (PPT Deck) */}
      {activeTab === "ppt" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stage 2: Presentation Deck (PDF)</CardTitle>
                <CardDescription>
                  Upload your pitch or technical architecture deck (PDF format, max 10MB). Agents extract stack, API, and scalability claims for cross-stage verification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadPPT} className="space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
                    }`}
                  >
                    <UploadCloud
                      className={`w-8 h-8 mx-auto mb-2 transition-colors ${
                        isDragging ? "text-indigo-400" : "text-zinc-500"
                      }`}
                    />
                    <label className="block text-xs font-medium text-zinc-300 cursor-pointer">
                      <span className="text-indigo-400 hover:underline">Choose PDF file</span> or drag and drop here
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-zinc-500 mt-1">PDF format up to 10MB</p>
                    {pptFile && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 font-mono">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{pptFile.name}</span>
                        <span className="text-zinc-500">
                          ({(pptFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      isLoading={isUploadingPPT}
                      disabled={!pptFile}
                    >
                      Upload & Parse Deck
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEvaluatePPT}
                      isLoading={isEvaluatingPPT}
                      leftIcon={<Play className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      Run 3-Agent Evaluation
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Extracted Architecture Claims */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Extracted Architecture Claims</CardTitle>
                  <Badge variant="purple" size="sm">
                    {pptClaims.length} Claims
                  </Badge>
                </div>
                <CardDescription>
                  Claims parsed from your deck to be cross-checked against your GitHub codebase in Stage 3.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pptClaims.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
                    <p className="text-xs">No claims extracted yet.</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Upload your PDF presentation deck and run evaluation to extract technical claims.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pptClaims.map((claim, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs"
                      >
                        <div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 mr-2 uppercase">
                            {claim.claim_type}
                          </span>
                          <span className="text-zinc-200 font-medium">{claim.claim_text}</span>
                        </div>
                        <Badge
                          variant={claim.verification_status === "verified" ? "success" : "outline"}
                          size="sm"
                        >
                          {claim.verification_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {pptEval ? (
              <Card variant="elevated" className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Stage 2 AI Evaluation
                    </span>
                    <h3 className="text-base font-bold text-zinc-100">Score & PPT Breakdown</h3>
                  </div>
                  <ScoreMeter score={pptEval.score} size="sm" />
                </div>

                <div className="space-y-3">
                  {Object.entries(pptEval.agents || {}).map(([agentName, data]) => (
                    <div
                      key={agentName}
                      className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{agentName}</span>
                        <span className="font-mono text-emerald-400 font-bold">{data.score}/100</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-3">
                        {data.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card variant="subtle" className="text-center py-12 px-4">
                <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-zinc-300">No PPT Evaluation Yet</h4>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                  Upload a PDF deck to extract system claims and score presentation quality.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Stage 3 (Product) */}
      {activeTab === "product" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Stage 3: Repository & Live Deployment</CardTitle>
                  <button
                    type="button"
                    onClick={handleFillDemoProduct}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Fill Demo Links</span>
                  </button>
                </div>
                <CardDescription>
                  Register your GitHub repository and live deployment URL for tool-grounded evaluation (55% of final AI score).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <Input
                    label="GitHub Repository URL *"
                    placeholder="https://github.com/myteam/hackathon-project"
                    leftIcon={<Github className="w-4 h-4" />}
                    value={productForm.github_url}
                    onChange={(e) =>
                      setProductForm({ ...productForm, github_url: e.target.value })
                    }
                  />

                  <Input
                    label="Live Deployment URL"
                    placeholder="https://myteam-project.vercel.app"
                    leftIcon={<Globe className="w-4 h-4 text-emerald-400" />}
                    value={productForm.live_url}
                    onChange={(e) =>
                      setProductForm({ ...productForm, live_url: e.target.value })
                    }
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <Button type="submit" size="sm" variant="secondary" isLoading={isSavingProduct}>
                      Update Links
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleEvaluateProduct}
                      isLoading={isEvaluatingProduct}
                      leftIcon={<Play className="w-3.5 h-3.5 text-emerald-400" />}
                    >
                      Run 5-Agent Product Evaluation
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {productEval ? (
              <Card variant="elevated" className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Stage 3 AI Evaluation
                    </span>
                    <h3 className="text-base font-bold text-zinc-100">Product & Tool Findings</h3>
                  </div>
                  <ScoreMeter score={productEval.score} size="sm" />
                </div>

                <div className="space-y-3">
                  {Object.entries(productEval.agents || {}).map(([agentName, data]) => (
                    <div
                      key={agentName}
                      className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{agentName}</span>
                        <span className="font-mono text-emerald-400 font-bold">{data.score}/100</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-3">
                        {data.reasoning}
                      </p>
                    </div>
                  ))}
                </div>

                {productEval.evidence && productEval.evidence.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                      Deterministic Tool Findings:
                    </div>
                    <div className="space-y-1.5">
                      {productEval.evidence.map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-zinc-900/80 border border-zinc-800/60 text-[11px] text-zinc-300 font-mono truncate"
                        >
                          <span className="text-emerald-400 mr-1.5">[{ev.type}]</span>
                          {ev.summary}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card variant="subtle" className="text-center py-12 px-4">
                <Code2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-zinc-300">No Product Evaluation Yet</h4>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                  Provide your repository and deployment URL to trigger static analysis, security scans, and code quality agents.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Instant Diagnostics (<90s) */}
      {activeTab === "feedback" && (
        <div className="space-y-6">
          <Card className="bg-zinc-950/60 border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-zinc-100">
                    Instant Pre-Judging Diagnostics
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Private diagnostic report across 8 dimensions in under 90 seconds. Does not affect your official score — use this checklist to patch bugs before judging locks.
                </p>
              </div>

              <Button
                onClick={handleTriggerInstantFeedback}
                isLoading={isSubmittingFeedback}
                leftIcon={<Zap className="w-4 h-4 text-sky-400" />}
              >
                Run Instant Diagnostic
              </Button>
            </div>

            {feedbackReport ? (
              <div className="mt-6 space-y-6">
                {/* Overall Health Pill */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-400">Diagnostic Verdict:</span>
                    <Badge
                      variant={
                        feedbackReport.overall_health === "ok"
                          ? "success"
                          : feedbackReport.overall_health === "needs_attention"
                          ? "warning"
                          : "danger"
                      }
                      size="md"
                    >
                      {feedbackReport.overall_health.toUpperCase().replace("_", " ")}
                    </Badge>
                  </div>
                  {feedbackReport.created_at && (
                    <span className="text-[11px] font-mono text-zinc-500">
                      Ran at {new Date(feedbackReport.created_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {/* Top Actionable Fixes */}
                {feedbackReport.top_fixes && feedbackReport.top_fixes.length > 0 && (
                  <Card variant="subtle" className="border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Priority Action Checklist Before Submission</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {feedbackReport.top_fixes.map((fix, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono text-amber-400 font-bold shrink-0">
                            0{idx + 1}.
                          </span>
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* 8-Dimension Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(feedbackReport.dimensions || {}).map(([dimKey, dim]) => (
                    <div
                      key={dimKey}
                      className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-zinc-200 capitalize">
                            {dimKey.replace(/_/g, " ")}
                          </span>
                          <Badge
                            variant={
                              dim.status === "ok"
                                ? "success"
                                : dim.status === "needs_attention"
                                ? "warning"
                                : "danger"
                            }
                            size="sm"
                          >
                            {dim.status}
                          </Badge>
                        </div>
                        {dim.response_ms && (
                          <div className="text-[11px] font-mono text-zinc-400">
                            Latency: {dim.response_ms}ms
                          </div>
                        )}
                        {dim.notes && dim.notes.length > 0 && (
                          <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                            {dim.notes.join(", ")}
                          </div>
                        )}
                        {dim.findings && dim.findings.length > 0 && (
                          <div className="text-[11px] text-rose-400 mt-1 line-clamp-2 font-mono">
                            {dim.findings.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                <Zap className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-zinc-300">No Instant Diagnostics Run Yet</h4>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                  Click "Run Instant Diagnostic" to receive instant automated checks on code quality, security, and uptime.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
