"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Flame,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Activity,
  Calculator,
  Layers,
  Sliders,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { AdminAPI, CreateHackathonPayload } from "@/lib/api/admin";
import { FinalizationAPI } from "@/lib/api/finalization";
import { ProjectsAPI } from "@/lib/api/projects";
import { Hackathon, PlagiarismFlag, Project } from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { useAuth } from "@/lib/store/auth-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs } from "@/components/ui/Tabs";
import { RoleGuard } from "@/components/ui/RoleGuard";

export default function AdminControlRoomPage() {
  const { role } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<string>("finalization");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [flags, setFlags] = useState<PlagiarismFlag[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [computingProjectId, setComputingProjectId] = useState<string | null>(null);
  const [isResettingDb, setIsResettingDb] = useState<boolean>(false);

  // New Hackathon Modal State
  const [isHackathonModalOpen, setIsHackathonModalOpen] = useState(false);
  const [hackathonForm, setHackathonForm] = useState<{
    name: string;
    description: string;
    status: string;
    ideaWeight: number;
    pptWeight: number;
    productWeight: number;
  }>({
    name: "",
    description: "",
    status: "active",
    ideaWeight: 20,
    pptWeight: 25,
    productWeight: 55,
  });
  const [isCreatingHackathon, setIsCreatingHackathon] = useState(false);

  const loadData = async () => {
    if (role !== "admin") return;
    try {
      setIsLoading(true);
      const [hList, fList, pList] = await Promise.all([
        AdminAPI.listHackathons().catch(() => []),
        AdminAPI.getPlagiarismFlags().catch(() => []),
        ProjectsAPI.list().catch(() => []),
      ]);
      setHackathons(hList || []);
      setFlags(fList || []);
      setProjects(pList || []);
    } catch (err: any) {
      error(err.message || "Failed to load admin telemetry");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const [aiWeight, setAiWeight] = useState<number>(70);
  const humanWeight = 100 - aiWeight;

  const handleComputeFinalScore = async (projectId: string, projectName: string) => {
    try {
      setComputingProjectId(projectId);
      const res = await FinalizationAPI.computeFinalScore(projectId, {
        ai_weight: aiWeight / 100,
        human_weight: humanWeight / 100,
      });
      success(`Final composite score computed for "${projectName}": ${res.final_score} pts (${aiWeight}% AI + ${humanWeight}% Human)!`);
      loadData();
    } catch (err: any) {
      error(err.message || "Failed to compute final score");
    } finally {
      setComputingProjectId(null);
    }
  };

  const handleResetDatabase = async () => {
    if (
      !confirm(
        "Reset the entire evaluation database? This will purge all orphan test records and restore the 5 pristine showcase projects."
      )
    ) {
      return;
    }

    try {
      setIsResettingDb(true);
      await AdminAPI.resetDatabase();
      success("Database reset to 5 pristine seed projects!");
      loadData();
    } catch (err: any) {
      error(err.message || "Failed to reset database");
    } finally {
      setIsResettingDb(false);
    }
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackathonForm.name.trim()) {
      error("Hackathon name is required");
      return;
    }

    const totalWeight =
      hackathonForm.ideaWeight + hackathonForm.pptWeight + hackathonForm.productWeight;
    if (totalWeight !== 100) {
      error(`Total rubric weights must sum to 100% (currently ${totalWeight}%)`);
      return;
    }

    try {
      setIsCreatingHackathon(true);
      await AdminAPI.createHackathon({
        name: hackathonForm.name,
        description: hackathonForm.description,
        status: hackathonForm.status,
        rubric_weights: {
          idea: hackathonForm.ideaWeight / 100,
          ppt: hackathonForm.pptWeight / 100,
          product: hackathonForm.productWeight / 100,
        },
      });
      success(`Hackathon "${hackathonForm.name}" created`);
      setIsHackathonModalOpen(false);
      setHackathonForm({
        name: "",
        description: "",
        status: "active",
        ideaWeight: 20,
        pptWeight: 25,
        productWeight: 55,
      });
      loadData();
    } catch (err: any) {
      error(err.message || "Failed to create hackathon");
    } finally {
      setIsCreatingHackathon(false);
    }
  };

  const adminTabs = [
    {
      id: "finalization",
      label: "Score Finalization & Leaderboard Publish",
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      id: "plagiarism",
      label: "Anti-Cheating & Plagiarism Matrix",
      icon: <Flame className="w-4 h-4 text-red-400" />,
      badge: flags.length ? `${flags.length}` : undefined,
    },
    {
      id: "hackathons",
      label: "Hackathon Events & Rubric Tuner",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <RoleGuard
      allowedRoles={["admin"]}
      title="Admin & Governance Control Room Restricted"
      description="The Admin Control Room is restricted to Hackathon Organizers and Platform Administrators. Switch to Admin mode in dev settings to manage rubric weights, anti-cheating telemetry, and score finalization."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full bg-black text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                JuryX Admin & Governance Control Room
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Publish finalized scores, inspect plagiarism telemetry, and configure hackathon rubric weights.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDatabase}
              isLoading={isResettingDb}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              title="Purge test records and restore 5 pristine seed projects"
            >
              Reset Seed Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Telemetry
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="my-6">
          <Tabs tabs={adminTabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* TAB 1: Score Finalization */}
        {activeTab === "finalization" && (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white">Batch Finalization Trigger & Scoring Ratio Calibrator</CardTitle>
                  <CardDescription>
                    Synthesizes multi-agent scores with human judge ratings into a definitive composite score. Adjust the AI vs. Human weight ratio in real-time.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">
                    AI: {aiWeight}%
                  </Badge>
                  <span className="text-zinc-600 font-mono">+</span>
                  <Badge variant="default" size="sm">
                    HUMAN: {humanWeight}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Interactive Weight Calibrator */}
              <div className="mb-6 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-white" />
                    <span className="text-xs font-semibold text-zinc-200">
                      Scoring Weight Ratio Calibrator
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAiWeight(70)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        aiWeight === 70
                          ? "bg-white text-black border-white font-bold"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      70/30 (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiWeight(50)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        aiWeight === 50
                          ? "bg-white text-black border-white font-bold"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      50/50 Balanced
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiWeight(85)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        aiWeight === 85
                          ? "bg-white text-black border-white font-bold"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                      }`}
                    >
                      85/15 High AI
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">AI Swarm Weight: {aiWeight}%</span>
                    <span className="text-emerald-400">Human Judge Weight: {humanWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={aiWeight}
                    onChange={(e) => setAiWeight(Number(e.target.value))}
                    className="w-full accent-white cursor-pointer bg-zinc-800 rounded-lg h-2"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-zinc-500">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
                  <p className="text-xs font-mono">Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <p className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No projects available for finalization.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Project Name</th>
                        <th className="py-3 px-4">Current Stage</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 font-mono">
                      {projects.map((p) => {
                        const isComputing = computingProjectId === p.id;
                        const isFinalized = p.status === "finalized";

                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="py-3.5 px-4 font-sans font-semibold text-white">
                              {p.name}
                            </td>
                            <td className="py-3.5 px-4 uppercase text-zinc-400">
                              {p.status}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                variant={isFinalized ? "success" : "default"}
                                size="sm"
                              >
                                {isFinalized ? "FINALIZED" : "PENDING FINALIZATION"}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant={isFinalized ? "outline" : "primary"}
                                isLoading={isComputing}
                                onClick={() => handleComputeFinalScore(p.id, p.name)}
                              >
                                {isFinalized ? "Re-Compute Score" : "Compute & Publish"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: Plagiarism Matrix */}
        {activeTab === "plagiarism" && (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Anti-Cheating & Cross-Project Similarity Matrix</CardTitle>
              <CardDescription>
                Live AST structure hashes and text embeddings flags for cross-team plagiarism or public benchmark leakage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flags.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 font-mono">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-white">Zero high-confidence plagiarism flags detected across all projects.</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Cross-project AST token similarity is within nominal parameters (&lt;30%).</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flags.map((flag) => (
                    <div
                      key={flag.flag_id}
                      className="p-4 rounded-xl bg-zinc-900 border border-red-800/60 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-400">
                            Similarity Match: {(flag.similarity_score * 100).toFixed(1)}%
                          </span>
                          <Badge variant="danger" size="sm">
                            {flag.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-zinc-300 text-[11px]">
                          Target Project: <span className="font-mono text-white">{flag.project_name} ({flag.project_id})</span> • Source:{" "}
                          <span className="font-mono text-white">{flag.matched_source || "Public Repo Benchmark"}</span>
                        </p>
                      </div>

                      <Badge variant="danger" size="sm">
                        RISK ALERT
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: Hackathons & Rubrics */}
        {activeTab === "hackathons" && (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader
              action={
                <Button
                  size="sm"
                  onClick={() => setIsHackathonModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  New Hackathon
                </Button>
              }
            >
              <CardTitle className="text-white">Active Hackathons & Multi-Stage Rubrics</CardTitle>
              <CardDescription>
                Configure stage weights (Idea, PPT, Product) and active deadlines per hackathon tournament.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hackathons.map((h) => (
                  <div
                    key={h.id}
                    className="p-4.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{h.name}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{h.description}</p>
                      </div>
                      <Badge variant={h.status === "active" ? "success" : "default"} size="sm">
                        {h.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-400 text-[10px] block">Idea Weight</span>
                        <span className="font-bold text-white">
                          {((h.rubric_weights?.idea || 0.2) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-400 text-[10px] block">PPT Weight</span>
                        <span className="font-bold text-white">
                          {((h.rubric_weights?.ppt || 0.25) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-400 text-[10px] block">Product</span>
                        <span className="font-bold text-white">
                          {((h.rubric_weights?.product || 0.55) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal: New Hackathon */}
        <Modal
          isOpen={isHackathonModalOpen}
          onClose={() => setIsHackathonModalOpen(false)}
          title="Create New Hackathon Tournament"
          description="Define tournament properties and stage scoring weights. Total weights must sum to 100%."
        >
          <form onSubmit={handleCreateHackathon} className="space-y-4">
            <Input
              label="Hackathon Name *"
              placeholder="e.g. Next-Gen Web3 & AI Summit 2026"
              value={hackathonForm.name}
              onChange={(e) => setHackathonForm({ ...hackathonForm, name: e.target.value })}
              required
            />

            <Textarea
              label="Description"
              placeholder="Brief description of the challenge domain and eligibility..."
              value={hackathonForm.description}
              onChange={(e) =>
                setHackathonForm({ ...hackathonForm, description: e.target.value })
              }
              rows={3}
            />

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <span className="text-xs font-semibold text-zinc-300 block">
                Multi-Stage Rubric Weights (Must sum to 100%):
              </span>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Idea Weight (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={hackathonForm.ideaWeight}
                  onChange={(e) =>
                    setHackathonForm({ ...hackathonForm, ideaWeight: Number(e.target.value) })
                  }
                />
                <Input
                  label="PPT Weight (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={hackathonForm.pptWeight}
                  onChange={(e) =>
                    setHackathonForm({ ...hackathonForm, pptWeight: Number(e.target.value) })
                  }
                />
                <Input
                  label="Product Weight (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={hackathonForm.productWeight}
                  onChange={(e) =>
                    setHackathonForm({ ...hackathonForm, productWeight: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsHackathonModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isCreatingHackathon}>
                Create Event
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
