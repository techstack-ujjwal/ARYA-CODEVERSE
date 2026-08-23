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
      icon: <Flame className="w-4 h-4 text-rose-400" />,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
                Admin & Governance Control Room
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
          <Card className="bg-zinc-950/60 border-zinc-800">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Batch Finalization Trigger & Scoring Ratio Calibrator</CardTitle>
                  <CardDescription>
                    Synthesizes multi-agent scores with human judge ratings into a definitive composite score. Adjust the AI vs. Human weight ratio in real-time.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="purple" size="sm">
                    AI: {aiWeight}%
                  </Badge>
                  <span className="text-zinc-600 font-mono">+</span>
                  <Badge variant="warning" size="sm">
                    HUMAN: {humanWeight}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Interactive Weight Calibrator */}
              <div className="mb-6 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
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
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      70/30 (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiWeight(50)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        aiWeight === 50
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      50/50 Balanced
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiWeight(85)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        aiWeight === 85
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      85/15 High-AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiWeight(100)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        aiWeight === 100
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      100% Autonomous AI
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="text-indigo-400">🤖 AI Engine: {aiWeight}%</span>
                    <span className="text-amber-400">⚖️ Human Judges: {humanWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={aiWeight}
                    onChange={(e) => setAiWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                    <span>0% (Human Only)</span>
                    <span>50%</span>
                    <span>70% (Standard)</span>
                    <span>100% (AI Autonomous)</span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-zinc-500">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-mono">Loading projects telemetry...</p>
                </div>
              ) : projects.length === 0 ? (
                <p className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No projects registered in this hackathon.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Project Name</th>
                        <th className="py-3 px-4">Pipeline Status</th>
                        <th className="py-3 px-4">AI Score (70%)</th>
                        <th className="py-3 px-4">Human Judge (30%)</th>
                        <th className="py-3 px-4">Final Composite</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {projects.map((p) => {
                        const isFinalized = p.status === "finalized";
                        const isComputing = computingProjectId === p.id;

                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-zinc-200">
                              {p.name}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                variant={
                                  isFinalized
                                    ? "success"
                                    : p.status === "product"
                                    ? "purple"
                                    : p.status === "ppt"
                                    ? "warning"
                                    : "default"
                                }
                                size="sm"
                              >
                                {p.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-zinc-300">
                              {p.status === "idea" ? (
                                <span className="text-zinc-600">Pending</span>
                              ) : (
                                "Calculated"
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-zinc-300">
                              {isFinalized ? (
                                <span className="text-amber-400 font-bold">Graded</span>
                              ) : (
                                <span className="text-zinc-500">In Queue</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">
                              {isFinalized ? (
                                <span className="text-emerald-400 font-mono text-sm">Published</span>
                              ) : (
                                <span className="text-zinc-600">--</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant={isFinalized ? "outline" : "primary"}
                                onClick={() => handleComputeFinalScore(p.id, p.name)}
                                isLoading={isComputing}
                                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                              >
                                {isFinalized ? "Re-Compute" : "Finalize Score"}
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
          <Card className="bg-zinc-950/60 border-zinc-800">
            <CardHeader>
              <CardTitle>Anti-Cheating & Plagiarism Matrix</CardTitle>
              <CardDescription>
                Submissions flagged by the similarity vector agent against public GitHub repositories and prior hackathon entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flags.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-xs font-semibold text-zinc-300">
                    Zero Plagiarism Flags Detected
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    All analyzed project submissions are within acceptable uniqueness thresholds.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flags.map((flag) => (
                    <div
                      key={flag.flag_id}
                      className="p-4 rounded-xl bg-zinc-900/80 border border-rose-500/20 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-100">{flag.project_name}</span>
                        <Badge variant="danger" size="sm">
                          {Math.round(flag.similarity_score * 100)}% SIMILARITY
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Matched Source: <span className="text-zinc-200">{flag.matched_source}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: Hackathons & Rubrics */}
        {activeTab === "hackathons" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsHackathonModalOpen(true)}
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Hackathon Event
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hackathons.map((h) => (
                <Card key={h.id} className="p-5 bg-zinc-900/60 border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="purple" size="sm">
                      {h.status.toUpperCase()}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">{h.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {h.description || "Active Hackathon Event"}
                  </p>

                  <div className="mt-4 pt-3 border-t border-zinc-800 font-mono text-[11px] text-zinc-400 space-y-1">
                    <div>Idea Weight: {((h.rubric_weights?.idea || 0.2) * 100).toFixed(0)}%</div>
                    <div>PPT Deck Weight: {((h.rubric_weights?.ppt || 0.25) * 100).toFixed(0)}%</div>
                    <div>Product Weight: {((h.rubric_weights?.product || 0.55) * 100).toFixed(0)}%</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Create Hackathon Modal */}
        <Modal
          isOpen={isHackathonModalOpen}
          onClose={() => setIsHackathonModalOpen(false)}
          title="Create New Hackathon Event"
          description="Define event name and custom rubric weights for the multi-agent pipeline."
        >
          <form onSubmit={handleCreateHackathon} className="space-y-4">
            <Input
              label="Hackathon Name *"
              placeholder="e.g. AI Breakthrough Hackathon 2026"
              value={hackathonForm.name}
              onChange={(e) => setHackathonForm({ ...hackathonForm, name: e.target.value })}
              required
            />

            <Textarea
              label="Description"
              placeholder="Event theme, target developer cohort, guidelines..."
              value={hackathonForm.description || ""}
              onChange={(e) =>
                setHackathonForm({ ...hackathonForm, description: e.target.value })
              }
              rows={2}
            />

            {/* Rubric Weights Tuner */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Custom Stage Rubric Weights</span>
                </span>
                <span
                  className={`font-mono ${
                    hackathonForm.ideaWeight + hackathonForm.pptWeight + hackathonForm.productWeight === 100
                      ? "text-emerald-400 font-bold"
                      : "text-rose-400 font-bold"
                  }`}
                >
                  Total: {hackathonForm.ideaWeight + hackathonForm.pptWeight + hackathonForm.productWeight}% / 100%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <Input
                  label="Stage 1 Idea (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={hackathonForm.ideaWeight}
                  onChange={(e) =>
                    setHackathonForm({
                      ...hackathonForm,
                      ideaWeight: parseInt(e.target.value) || 0,
                    })
                  }
                />

                <Input
                  label="Stage 2 PPT (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={hackathonForm.pptWeight}
                  onChange={(e) =>
                    setHackathonForm({
                      ...hackathonForm,
                      pptWeight: parseInt(e.target.value) || 0,
                    })
                  }
                />

                <Input
                  label="Stage 3 Product (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={hackathonForm.productWeight}
                  onChange={(e) =>
                    setHackathonForm({
                      ...hackathonForm,
                      productWeight: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsHackathonModalOpen(false)}
                disabled={isCreatingHackathon}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreatingHackathon}>
                Create Hackathon
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
