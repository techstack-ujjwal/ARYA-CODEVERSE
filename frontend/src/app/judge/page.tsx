"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Sliders,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  Wand2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Filter,
  Check,
  Clock,
} from "lucide-react";
import { JudgingAPI, JudgeScorePayload } from "@/lib/api/judging";
import { ProjectsAPI } from "@/lib/api/projects";
import { Project, JudgeAssignment } from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { useAuth } from "@/lib/store/auth-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardSlot, CardBadge } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { RoleGuard } from "@/components/ui/RoleGuard";
import { Toggle } from "@/components/ui/Toggle";

export default function JudgePortalPage() {
  const { role } = useAuth();
  const { toast, success, error } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Interactive UI Toggle: Filter Pending Only
  const [pendingOnly, setPendingOnly] = useState<boolean>(false);

  // Scoring Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scorePayload, setScorePayload] = useState<JudgeScorePayload>({
    score: 85,
    feedback: "",
    override_reason: "",
  });
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);

  const loadData = async () => {
    if (role !== "judge" && role !== "admin") return;
    try {
      setIsLoading(true);
      setFetchError(null);
      const [projList, assignList] = await Promise.all([
        ProjectsAPI.list(),
        JudgingAPI.getAssignedProjects().catch(() => []),
      ]);
      setProjects(projList || []);
      setAssignments(assignList || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load judging assignments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleOpenScoreModal = (project: Project) => {
    const existingAssign = assignments.find((a) => a.project_id === project.id);
    setSelectedProject(project);
    setScorePayload({
      score: existingAssign?.human_score || 85,
      feedback: "",
      override_reason: "",
    });
  };

  const handleFillDemoJudgeFeedback = () => {
    setScorePayload({
      score: 92,
      feedback:
        "Strong architecture execution with clear modular separation. Codebase passes static security hygiene with clean error boundaries and high responsiveness.",
      override_reason:
        "Elevated 4 points above baseline AI score due to outstanding live user workflow and verified edge cases.",
    });
    toast("Inserted sample judge rubric feedback", "info");
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setIsSubmittingScore(true);
      await JudgingAPI.submitScore(selectedProject.id, scorePayload);
      success(`Score of ${scorePayload.score} submitted for "${selectedProject.name}"`);
      setSelectedProject(null);
      loadData();
    } catch (err: any) {
      error(err.message || "Failed to submit judge score");
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const scoredCount = projects.filter((p) => {
    const a = assignments.find((assign) => assign.project_id === p.id);
    return a?.status === "scored" || p.status === "finalized";
  }).length;
  const pendingCount = projects.length - scoredCount;

  const displayProjects = projects.filter((p) => {
    if (!pendingOnly) return true;
    const a = assignments.find((assign) => assign.project_id === p.id);
    return !(a?.status === "scored" || p.status === "finalized");
  });

  return (
    <RoleGuard
      allowedRoles={["judge", "admin"]}
      title="Human Judge Portal Restricted"
      description="The Human Judge Portal is restricted to assigned Hackathon Judges and Evaluators. Switch to Judge mode in dev settings to inspect evidence dossiers and assign human rubric scores (30% weight)."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full bg-black text-white">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                <Award className="w-4.5 h-4.5" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                JuryX Human Judge Evaluation Portal
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Evaluate assigned hackathon submissions, inspect grounded AI evidence dossiers, and submit calibrated scores (30% weight).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Queue
            </Button>
          </div>
        </div>

        {/* Assigned Projects Table / Card Slots */}
        <div className="my-8">
          <Card variant="elevated" className="bg-zinc-950 border-zinc-800 shadow-xl">
            <CardHeader
              action={
                <div className="flex items-center gap-4">
                  {/* Interactive UI Toggle */}
                  <Toggle
                    checked={pendingOnly}
                    onChange={setPendingOnly}
                    size="sm"
                    variant="default"
                    label={
                      <span className="text-xs font-mono">
                        Pending Only ({pendingCount})
                      </span>
                    }
                  />
                </div>
              }
            >
              <CardTitle>
                <div className="flex items-center gap-2.5">
                  <span className="text-white">Evaluation Queue</span>
                  <Badge variant="default" size="sm">
                    {scoredCount} / {projects.length} SCORED
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Click "Score Project" to review student submissions, inspect multi-agent evidence dossiers, and calibrate your human rubric rating.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-zinc-500">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
                  <p className="text-xs font-mono">Loading evaluation queue...</p>
                </div>
              ) : displayProjects.length === 0 ? (
                <p className="py-8 text-center text-xs text-zinc-500 font-mono">
                  {pendingOnly ? "All assigned projects have been scored!" : "No projects available for evaluation."}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Project Name</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Human Score (30%)</th>
                        <th className="py-3 px-4">Evaluation State</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {displayProjects.map((p) => {
                        const assignment = assignments.find((a) => a.project_id === p.id);
                        const isScored = assignment?.status === "scored" || p.status === "finalized";

                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              <div className="flex flex-col">
                                <span>{p.name}</span>
                                <span className="text-[11px] text-zinc-500 line-clamp-1 font-normal">
                                  {p.description || "No description"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                variant={
                                  p.status === "finalized"
                                    ? "success"
                                    : "default"
                                }
                                size="sm"
                              >
                                {p.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">
                              {assignment?.human_score ? (
                                <span className="text-emerald-400">
                                  {assignment.human_score.toFixed(1)} / 100
                                </span>
                              ) : (
                                <span className="text-zinc-500 font-normal">Not Graded</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {isScored ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Scored
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                                  <Clock className="w-3.5 h-3.5" />
                                  Pending Review
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/projects/${p.id}/evaluation`}>
                                  <Button variant="ghost" size="sm">
                                    Dossier
                                  </Button>
                                </Link>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleOpenScoreModal(p)}
                                >
                                  {isScored ? "Edit Score" : "Score"}
                                </Button>
                              </div>
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
        </div>

        {/* Scoring Modal */}
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`Evaluate "${selectedProject?.name}"`}
          description="Assign your calibrated human score (0-100) and qualitative feedback. This represents 30% of the final composite ranking."
          maxWidth="md"
        >
          <form onSubmit={handleSubmitScore} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-mono text-zinc-400 uppercase">Qualitative Calibration</span>
              <button
                type="button"
                onClick={handleFillDemoJudgeFeedback}
                className="flex items-center gap-1 text-[11px] text-white hover:text-zinc-200 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded cursor-pointer"
              >
                <Wand2 className="w-3 h-3" />
                <span>Fill Sample Rubric</span>
              </button>
            </div>

            {/* Score Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400 font-semibold">Human Rubric Score:</span>
                <span className="text-xl font-bold text-emerald-400">
                  {scorePayload.score} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={scorePayload.score}
                onChange={(e) =>
                  setScorePayload({ ...scorePayload, score: Number(e.target.value) })
                }
                className="w-full accent-white cursor-pointer bg-zinc-800 rounded-lg h-2"
              />
            </div>

            <Textarea
              label="Judge Feedback & Rubric Notes *"
              placeholder="Provide constructive, actionable feedback across Architecture, Novelty, and UI/UX execution..."
              value={scorePayload.feedback}
              onChange={(e) =>
                setScorePayload({ ...scorePayload, feedback: e.target.value })
              }
              rows={4}
              required
            />

            <Textarea
              label="Calibration / Override Rationale (Optional)"
              placeholder="If modifying the AI baseline score significantly, provide notes for the audit trail..."
              value={scorePayload.override_reason}
              onChange={(e) =>
                setScorePayload({ ...scorePayload, override_reason: e.target.value })
              }
              rows={2}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedProject(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmittingScore}>
                Submit Official Rating
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
