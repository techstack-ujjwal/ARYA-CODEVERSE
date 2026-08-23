"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  Globe,
  Trash2,
  ChevronRight,
  Sparkles,
  Activity,
  AlertCircle,
  RefreshCw,
  X,
  Wand2,
  AlertTriangle,
  Award,
  ShieldCheck,
  Zap,
  ArrowRight,
  Trophy,
  LayoutGrid,
  LayoutList,
  Cpu,
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { ProjectsAPI, CreateProjectPayload } from "@/lib/api/projects";
import { AdminAPI } from "@/lib/api/admin";
import { FinalizationAPI } from "@/lib/api/finalization";
import { Project, Hackathon } from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { useAuth } from "@/lib/store/auth-context";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSlot,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle, SegmentedToggle } from "@/components/ui/Toggle";

export default function DashboardPage() {
  const { role, user } = useAuth();
  const { toast, success, error } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [scoresMap, setScoresMap] = useState<
    Record<string, { rank?: number; final_score?: number; ai_score?: number; human_score?: number }>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResettingDb, setIsResettingDb] = useState<boolean>(false);

  // UI Interactive Enhancements
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<CreateProjectPayload>({
    hackathon_id: "hack_global_ai_2026",
    name: "",
    description: "",
    github_url: "",
    live_url: "",
  });

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const [data, lbData, hData] = await Promise.all([
        ProjectsAPI.list(),
        FinalizationAPI.getLeaderboard().catch(() => []),
        ProjectsAPI.listHackathons().catch(() => []),
      ]);
      setProjects(data || []);
      setHackathons(hData || []);
      const map: Record<
        string,
        { rank?: number; final_score?: number; ai_score?: number; human_score?: number }
      > = {};
      (lbData || []).forEach((item: any) => {
        map[item.project_id] = {
          rank: item.rank,
          final_score: item.final_score,
          ai_score: item.ai_score,
          human_score: item.human_score,
        };
      });
      setScoresMap(map);
    } catch (err: any) {
      setFetchError(
        err.message || "Could not connect to backend server. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const handleAuthChange = () => fetchProjects();
    window.addEventListener("eval_auth_changed", handleAuthChange);
    return () => window.removeEventListener("eval_auth_changed", handleAuthChange);
  }, [role]);

  // Live Auto-Refresh Timer Toggle Effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchProjects();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleParticipateInHackathon = (hackathonId: string) => {
    setFormData((prev) => ({
      ...prev,
      hackathon_id: hackathonId,
    }));
    setIsCreateModalOpen(true);
    const matched = hackathons.find((h) => h.id === hackathonId);
    toast(`Enrolling in ${matched?.name || "Hackathon"} — register your project details below.`, "info");
  };

  const handleFillDemoProject = () => {
    setFormData({
      hackathon_id: hackathons[0]?.id || "hack_global_ai_2026",
      name: "MindScope AI",
      description:
        "Student mental health early-warning engine using privacy-preserving federated learning over LMS signals.",
      github_url: "https://github.com/techstack-ujjwal/ARYA-CODEVERSE",
      live_url: "https://juryx-demo.vercel.app",
    });
    toast("Pre-filled sample project details", "info");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error("Project name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const newProj = await ProjectsAPI.create(formData);
      success(`Project "${newProj.name}" registered successfully!`);
      setIsCreateModalOpen(false);
      setFormData({
        hackathon_id: hackathons[0]?.id || "hack_global_ai_2026",
        name: "",
        description: "",
        github_url: "",
        live_url: "",
      });
      fetchProjects();
    } catch (err: any) {
      error(err.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await ProjectsAPI.delete(id);
      success("Project deleted successfully");
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      error(err.message || "Failed to delete project");
    }
  };

  const handleAdminResetDb = async () => {
    if (!confirm("Reset database? This will restore the 5 pristine showcase projects and purge test records.")) {
      return;
    }
    try {
      setIsResettingDb(true);
      await AdminAPI.resetDatabase();
      success("Database reset to 5 pristine seed projects!");
      fetchProjects();
    } catch (err: any) {
      error(err.message || "Failed to reset database");
    } finally {
      setIsResettingDb(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full bg-black text-white">
      {/* Role-Adaptive Hero Banner */}
      {role === "participant" && (
        <div className="mb-8 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm">
                PARTICIPANT WORKSPACE
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                Active User: {user?.email || "alex.chen@hackathon.dev"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Build, Submit & Verify Your Hackathon Project
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Progress through the 3-stage pipeline: <strong className="text-white">Idea (20%)</strong>,{" "}
              <strong className="text-white">PPT Deck (25%)</strong>, and{" "}
              <strong className="text-white">Product Code & Live URL (55%)</strong>. Run private pre-judging diagnostics in under 90 seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              size="md"
            >
              Register New Project
            </Button>
          </div>
        </div>
      )}

      {role === "judge" && (
        <div className="mb-8 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm">
                JUDGE EVALUATION HUB
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                Judge: {user?.email || "s.jenkins@stanford.edu"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Review AI Evidence Dossiers & Calibrate Human Scores
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inspect grounded multi-agent evidence across all active hackathon entries. Submit your qualitative rubric rating (
              <strong className="text-emerald-400">30% weight</strong> in the final composite score).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/judge">
              <Button
                variant="primary"
                leftIcon={<Award className="w-4 h-4" />}
                size="md"
              >
                Open Judge Portal
              </Button>
            </Link>
          </div>
        </div>
      )}

      {role === "admin" && (
        <div className="mb-8 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                ADMIN CONTROL ROOM
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                Director: {user?.email || "marcus.vance@hackathon.global"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Global Hackathon Governance & Finalization
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Configure rubric weights, inspect similarity/anti-cheating telemetry, trigger 70/30 composite score calculations, or reset the evaluation database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/admin">
              <Button
                variant="primary"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                size="md"
              >
                Admin Control Room
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              onClick={handleAdminResetDb}
              isLoading={isResettingDb}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset Seed Data
            </Button>
          </div>
        </div>
      )}

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="glass" className="p-4.5 bg-zinc-950 border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium">
              {role === "participant" ? "My Submissions" : "Total Projects"}
            </div>
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-white mt-2">
            {projects.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
            <span>Across all active cohorts</span>
          </div>
        </Card>

        <Card variant="glass" className="p-4.5 bg-zinc-950 border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium">
              Active Event
            </div>
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-bold text-white mt-2 truncate">
            {hackathons[0]?.name || "Global AI Hackathon"}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1 font-mono">
            <span>{hackathons.length} Competitions Live</span>
          </div>
        </Card>

        <Card variant="glass" className="p-4.5 bg-zinc-950 border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium">
              Evaluation Pipeline
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            17 AI Agents Active
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">
            Parallel multi-agent swarm
          </div>
        </Card>

        <Card variant="glass" className="p-4.5 bg-zinc-950 border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-medium">
              Diagnostics Ready
            </div>
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-bold text-white mt-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Sub-90s Turnaround
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">
            8 verification dimensions
          </div>
        </Card>
      </div>

      {/* Active Hackathons Section */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Active Hackathons & Competitions
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select an active event to enroll, register your project team, and begin submitting stage deliverables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">
              {hackathons.length} Active Events Available
            </span>
          </div>
        </div>

        {hackathons.length === 0 ? (
          <Card variant="subtle" className="p-6 text-center text-zinc-400 bg-zinc-950">
            <p className="text-xs">No active hackathons found. Create one in Admin or seed the database.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {hackathons.map((hackathon) => {
              const enrolledCount = projects.filter((p) => p.hackathon_id === hackathon.id).length;
              const isEnrolled = enrolledCount > 0;

              return (
                <Card
                  key={hackathon.id}
                  variant="elevated"
                  hoverable
                  className="flex flex-col justify-between p-5 bg-zinc-950 border-zinc-800"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant={hackathon.status === "active" ? "success" : "default"} size="sm">
                        {hackathon.status.toUpperCase()}
                      </Badge>
                      {isEnrolled ? (
                        <Badge variant="default" size="sm">
                          ENROLLED ({enrolledCount})
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm">
                          OPEN TO JOIN
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                      {hackathon.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">
                      {hackathon.description || "Official Hackathon Competition"}
                    </p>

                    {/* Rubric Weights Slot */}
                    <CardSlot variant="muted" className="mt-4 font-mono text-[11px] space-y-2">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                        Multi-Agent Stage Rubric:
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px]">
                          <span className="text-zinc-400">Idea</span>
                          <div className="font-bold text-white">
                            {((hackathon.rubric_weights?.idea || 0.20) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px]">
                          <span className="text-zinc-400">PPT</span>
                          <div className="font-bold text-white">
                            {((hackathon.rubric_weights?.ppt || 0.25) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px]">
                          <span className="text-zinc-400">Product</span>
                          <div className="font-bold text-white">
                            {((hackathon.rubric_weights?.product || 0.55) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </CardSlot>
                  </div>

                  <CardFooter className="mt-5 pt-3 border-t border-zinc-800 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isEnrolled ? "outline" : "primary"}
                      className="w-full justify-center gap-1.5 text-xs font-semibold"
                      onClick={() => handleParticipateInHackathon(hackathon.id)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      {isEnrolled ? "Submit Another Project" : "Participate in Hackathon"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Projects Header & View Toggle Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-white" />
            <span>My Submitted Projects & Workspaces</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage stage submissions, trigger multi-agent evaluations, and review teacher feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px] max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle: Grid vs List */}
          <SegmentedToggle
            value={viewMode}
            onChange={(val) => setViewMode(val)}
            size="sm"
            options={[
              { value: "grid", label: "Grid", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { value: "list", label: "List", icon: <LayoutList className="w-3.5 h-3.5" /> },
            ]}
          />

          {/* Toggle: Live Auto-Refresh */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <Toggle
              checked={autoRefresh}
              onChange={(val) => {
                setAutoRefresh(val);
                if (val) toast("Live telemetry auto-refresh enabled (15s interval)", "info");
              }}
              size="sm"
              variant="emerald"
              label={
                <span className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      autoRefresh ? "bg-emerald-400 animate-ping" : "bg-zinc-600"
                    }`}
                  />
                  Live Sync
                </span>
              }
            />
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
          >
            Register Project
          </Button>
        </div>
      </div>

      {/* Projects Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-52 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 w-20 bg-zinc-800 rounded" />
                <div className="h-5 w-48 bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-800 rounded" />
              </div>
              <div className="h-8 w-full bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <Card variant="subtle" className="border-red-800/40 bg-red-950/20 p-8 text-center my-6">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">Backend Connection Error</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">{fetchError}</p>
          <Button
            onClick={fetchProjects}
            size="sm"
            variant="secondary"
            className="mt-4 gap-1.5"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </Button>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {searchQuery ? `No projects matching "${searchQuery}"` : "No projects registered yet"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5">
            {searchQuery
              ? "Check for typos or clear your search query."
              : "Choose an active hackathon above and register your project to start submitting deliverables."}
          </p>
          {searchQuery ? (
            <Button onClick={() => setSearchQuery("")} size="sm" variant="secondary">
              Clear Search Query
            </Button>
          ) : (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              size="sm"
            >
              Register First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isOwner = project.owner_id === user?.user_id || project.owner_id === "user_participant";
            const canDelete = role === "admin" || (role === "participant" && isOwner);
            const parentHackathon = hackathons.find((h) => h.id === project.hackathon_id);

            return (
              <Card
                key={project.id}
                variant="elevated"
                hoverable
                className="flex flex-col justify-between p-5 bg-zinc-950 border-zinc-800"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant={
                          project.status === "finalized"
                            ? "success"
                            : "default"
                        }
                        size="sm"
                      >
                        {project.status.toUpperCase()} STAGE
                      </Badge>
                      {parentHackathon && (
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                          {parentHackathon.name}
                        </span>
                      )}
                    </div>

                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer rounded-md hover:bg-zinc-800"
                        title={role === "admin" ? "Admin: Delete project" : "Delete your project"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">
                    {project.description || "No description provided for this project."}
                  </p>

                  {/* External Links Slot */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                    {project.github_url ? (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px] truncate max-w-[120px]">repo</span>
                      </a>
                    ) : (
                      <span className="text-zinc-600 flex items-center gap-1 text-[11px]">
                        <Github className="w-3.5 h-3.5" /> no repo
                      </span>
                    )}

                    <span className="text-zinc-700">•</span>

                    {project.live_url ? (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-[11px] truncate max-w-[120px]">live app</span>
                      </a>
                    ) : (
                      <span className="text-zinc-600 flex items-center gap-1 text-[11px]">
                        <Globe className="w-3.5 h-3.5" /> no live url
                      </span>
                    )}
                  </div>

                  {scoresMap[project.id]?.final_score !== undefined ? (
                    <CardSlot variant="default" className="mt-3.5 p-3 flex items-center justify-between font-mono bg-zinc-900 border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center shrink-0">
                          <Trophy className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                            Rank #{scoresMap[project.id].rank} • Composite
                          </div>
                          <div className="text-xs text-white font-black">
                            {scoresMap[project.id].final_score}{" "}
                            <span className="text-[10px] text-zinc-500 font-normal">/ 100</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-zinc-400 space-y-0.5">
                        <div>
                          AI: <span className="text-white font-bold">{scoresMap[project.id].ai_score}</span>
                        </div>
                        <div>
                          Judge: <span className="text-emerald-400 font-bold">{scoresMap[project.id].human_score}</span>
                        </div>
                      </div>
                    </CardSlot>
                  ) : (
                    <CardSlot variant="default" className="mt-3.5 p-3 flex items-center justify-between font-mono bg-zinc-900 border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Activity className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
                        <span className="text-[11px]">
                          Stage: <strong className="text-white capitalize">{project.status}</strong>
                        </span>
                      </div>
                      <span className="text-zinc-500 text-[10px] uppercase font-mono">In Evaluation</span>
                    </CardSlot>
                  )}
                </div>

                <CardFooter className="mt-5 pt-3.5 border-t border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full justify-between">
                        <span>Workspace & Stages</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                      </Button>
                    </Link>

                    <Link href={`/projects/${project.id}/evaluation`}>
                      <Button variant="outline" size="sm">
                        Audit Report
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Register Project */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New Hackathon Project"
        description="Enroll your team into an active hackathon to unlock the 3-stage evaluation workspace."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400">Target Hackathon</span>
            <button
              type="button"
              onClick={handleFillDemoProject}
              className="flex items-center gap-1 text-[11px] text-white hover:text-zinc-200 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded cursor-pointer"
            >
              <Wand2 className="w-3 h-3" />
              <span>Fill Demo Details</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Select Hackathon Tournament *
            </label>
            <select
              value={formData.hackathon_id}
              onChange={(e) => setFormData({ ...formData, hackathon_id: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
            >
              {hackathons.map((h) => (
                <option key={h.id} value={h.id} className="bg-zinc-900 text-white">
                  {h.name} ({h.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Project Name *"
            placeholder="e.g. NexusAgent - Autonomous Code Reviewer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Project Executive Summary"
            placeholder="Brief description of the problem, approach, and target user..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/myteam/project"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            />

            <Input
              label="Live Deployment URL"
              placeholder="https://myteam-project.vercel.app"
              value={formData.live_url}
              onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
