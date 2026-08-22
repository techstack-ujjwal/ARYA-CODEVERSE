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

export default function AdminControlRoomPage() {
  const { role, setRole } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<string>("finalization");
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [flags, setFlags] = useState<PlagiarismFlag[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [computingProjectId, setComputingProjectId] = useState<string | null>(null);

  // New Hackathon Modal State with customizable weights
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

  const handleComputeFinalScore = async (projectId: string, projectName: string) => {
    try {
      setComputingProjectId(projectId);
      const res = await FinalizationAPI.computeFinalScore(projectId);
      success(`Final composite score calculated for "${projectName}": ${res.final_score} pts!`);
      loadData();
    } catch (err: any) {
      error(err.message || "Failed to compute final score");
    } finally {
      setComputingProjectId(null);
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

  const isUnauthorizedRole = role !== "admin";

  const adminTabs = [
    {
      id: "finalization",
      label: "Score Finalization & Leaderboard Publish",
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      id: "plagiarism",
      label: "Anti-Cheating & Plagiarism Flags",
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      badge: flags.length ? `${flags.length}` : undefined,
    },
    {
      id: "hackathons",
      label: "Hackathon Events & Rubrics",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
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
          <Badge variant={isUnauthorizedRole ? "warning" : "success"} size="md">
            {role.toUpperCase()} MODE
          </Badge>
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

      {/* Role Notice */}
      {isUnauthorizedRole && (
        <Card variant="subtle" className="my-6 border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-zinc-200">
                You are viewing as <span className="font-bold text-amber-400">{role}</span>. Switch to Admin role to execute batch score computation.
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRole("admin")}
              className="shrink-0"
            >
              Switch to Admin Role
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="my-6">
        <Tabs tabs={adminTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB 1: Score Finalization */}
      {activeTab === "finalization" && (
        <Card className="bg-zinc-950/60 border-zinc-800">
          <CardHeader>
            <CardTitle>Batch Finalization Trigger (70% AI + 30% Human)</CardTitle>
            <CardDescription>
              Synthesizes multi-agent scores with human judge ratings into a definitive composite score and updates the public leaderboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-zinc-500">
                <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-500">
                No projects registered in this hackathon.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Project Name</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4">GitHub Repo</th>
                      <th className="py-3 px-4 text-right">Finalize Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-semibold text-zinc-100">
                          {p.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={p.status === "finalized" ? "success" : "default"}
                            size="sm"
                          >
                            {p.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px] truncate max-w-xs">
                          {p.github_url || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant={p.status === "finalized" ? "secondary" : "primary"}
                            onClick={() => handleComputeFinalScore(p.id, p.name)}
                            isLoading={computingProjectId === p.id}
                            leftIcon={<Calculator className="w-3.5 h-3.5" />}
                          >
                            {p.status === "finalized" ? "Re-Compute 70/30" : "Compute Final"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Anti-Cheating & Plagiarism Flags */}
      {activeTab === "plagiarism" && (
        <Card className="bg-zinc-950/60 border-zinc-800">
          <CardHeader>
            <CardTitle>Plagiarism & Codebase Similarity Flags</CardTitle>
            <CardDescription>
              Embeddings-based vector search compares submissions against public open-source repos and prior hackathon entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-zinc-200">
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
  );
}
