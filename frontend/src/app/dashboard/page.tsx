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
  UserCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { ProjectsAPI, CreateProjectPayload } from "@/lib/api/projects";
import { AdminAPI } from "@/lib/api/admin";
import { Project } from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { useAuth } from "@/lib/store/auth-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function DashboardPage() {
  const { role, user } = useAuth();
  const { toast, success, error } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResettingDb, setIsResettingDb] = useState<boolean>(false);

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
      const data = await ProjectsAPI.list();
      setProjects(data || []);
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

  const handleFillDemoProject = () => {
    setFormData({
      hackathon_id: "hack_global_ai_2026",
      name: "MindScope AI",
      description:
        "Student mental health early-warning engine using privacy-preserving federated learning over LMS signals.",
      github_url: "https://github.com/techstack-ujjwal/ARYA-CODEVERSE",
      live_url: "https://eval-engine-demo.vercel.app",
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
      success(`Project "${newProj.name}" registered successfully`);
      setIsCreateModalOpen(false);
      setFormData({
        hackathon_id: "hack_global_ai_2026",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Role-Adaptive Hero Banner */}
      {role === "participant" && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-zinc-900/60 to-zinc-950/80 border border-sky-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">
                PARTICIPANT WORKSPACE
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                Active User: {user?.email || "alex.chen@hackathon.dev"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Build, Submit & Verify Your Hackathon Project
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Progress through the 3-stage pipeline: <strong className="text-zinc-200">Idea (20%)</strong>, <strong className="text-zinc-200">PPT Deck (25%)</strong>, and <strong className="text-zinc-200">Product Code & Live URL (55%)</strong>. Run private pre-judging diagnostics in under 90 seconds.
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
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-zinc-950/80 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">
                JUDGE EVALUATION HUB
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                Judge: {user?.email || "s.jenkins@stanford.edu"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Review AI Evidence Dossiers & Calibrate Human Scores
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inspect grounded multi-agent evidence across all 5 active hackathon entries. Submit your qualitative rubric rating (<strong className="text-amber-400">30% weight</strong> in the final composite score).
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
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-950/80 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                ADMIN & GOVERNANCE CONTROL ROOM
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                Director: {user?.email || "marcus.vance@hackathon.global"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="subtle" className="p-4">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            {role === "participant" ? "My Submissions" : "Total Projects"}
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100 mt-1">
            {projects.length}
          </div>
        </Card>

        <Card variant="subtle" className="p-4">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Active Event
          </div>
          <div className="text-sm font-semibold text-zinc-200 mt-1 truncate">
            Global AI Hackathon
          </div>
        </Card>

        <Card variant="subtle" className="p-4">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Evaluation Pipeline
          </div>
          <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            12 AI Agents Active
          </div>
        </Card>

        <Card variant="subtle" className="p-4">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Instant Diagnostics
          </div>
          <div className="text-sm font-semibold text-sky-400 mt-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Sub-90s Ready
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by name or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Showing <strong className="text-zinc-200">{filteredProjects.length}</strong> of <strong className="text-zinc-200">{projects.length}</strong> projects</span>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-52 rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 w-20 bg-zinc-800 rounded" />
                <div className="h-5 w-48 bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-800/60 rounded" />
              </div>
              <div className="h-8 w-full bg-zinc-800/80 rounded" />
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <Card variant="subtle" className="border-rose-500/20 bg-rose-500/5 p-8 text-center my-6">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-200">Backend Connection Error</h3>
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
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">
            {searchQuery ? `No projects matching "${searchQuery}"` : "No projects in this view"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5">
            {searchQuery
              ? "Check for typos or clear your search query."
              : "Register your hackathon project to start submitting idea statements, architecture decks, and product links."}
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

            return (
              <Card
                key={project.id}
                hoverable
                className="flex flex-col justify-between p-5 bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge
                      variant={
                        project.status === "finalized"
                          ? "success"
                          : project.status === "product"
                          ? "purple"
                          : project.status === "ppt"
                          ? "warning"
                          : "default"
                      }
                      size="sm"
                    >
                      {project.status.toUpperCase()} STAGE
                    </Badge>

                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title={role === "admin" ? "Admin: Delete project" : "Delete your project"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-zinc-100 tracking-tight line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">
                    {project.description || "No description provided for this project."}
                  </p>

                  {/* External Links */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400">
                    {project.github_url ? (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px] truncate max-w-[120px]">
                          repo
                        </span>
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
                        className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-[11px] truncate max-w-[120px]">
                          live app
                        </span>
                      </a>
                    ) : (
                      <span className="text-zinc-600 flex items-center gap-1 text-[11px]">
                        <Globe className="w-3.5 h-3.5" /> no live url
                      </span>
                    )}
                  </div>
                </div>

                {/* Contextual Action Buttons based on Role */}
                <div className="mt-5 pt-3 border-t border-zinc-800/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full justify-between">
                        <span>Workspace & Stages</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                      </Button>
                    </Link>

                    <Link href={`/projects/${project.id}/evaluation`}>
                      <Button variant="outline" size="sm" title="Inspect Multi-Agent Evidence Dossier">
                        Audit
                      </Button>
                    </Link>
                  </div>

                  {role === "judge" && (
                    <Link href={`/judge`} className="block">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                        leftIcon={<Award className="w-3.5 h-3.5 text-amber-400" />}
                      >
                        Grade Submission (30%)
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create Project */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New Hackathon Project"
        description="Initialize your project entry to submit ideas, presentation decks, and repository links."
      >
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={handleFillDemoProject}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Wand2 className="w-3 h-3" />
            <span>Fill Demo Project</span>
          </button>
        </div>

        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name *"
            placeholder="e.g. MindScope AI, OmniScan, ZeroFraud"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Project Description"
            placeholder="Brief overview of the core problem, user journey, and technical vision..."
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <Input
            label="GitHub Repository URL"
            placeholder="https://github.com/org/repo"
            value={formData.github_url || ""}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
          />

          <Input
            label="Live Deployment URL"
            placeholder="https://your-project.vercel.app"
            value={formData.live_url || ""}
            onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Register Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
