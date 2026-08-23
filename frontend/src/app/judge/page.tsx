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
} from "lucide-react";
import { JudgingAPI, JudgeScorePayload } from "@/lib/api/judging";
import { ProjectsAPI } from "@/lib/api/projects";
import { Project, JudgeAssignment } from "@/types/api";
import { useToast } from "@/lib/store/toast-context";
import { useAuth } from "@/lib/store/auth-context";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { RoleGuard } from "@/components/ui/RoleGuard";

export default function JudgePortalPage() {
  const { role } = useAuth();
  const { toast, success, error } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  return (
    <RoleGuard
      allowedRoles={["judge", "admin"]}
      title="Human Judge Portal Restricted"
      description="The Human Judge Portal is restricted to assigned Hackathon Judges and Evaluators. Switch to Judge mode in dev settings to inspect evidence dossiers and assign human rubric scores (30% weight)."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <Award className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
                Human Judge Evaluation Portal
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Evaluate assigned hackathon submissions, inspect grounded AI evidence dossiers, and submit calibrated scores (30% weight).
            </p>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Assigned Projects Table / Cards */}
        <div className="my-8">
          <Card className="bg-zinc-950/60 border-zinc-800">
            <CardHeader>
              <CardTitle>Evaluation Queue ({projects.length} Total Projects)</CardTitle>
              <CardDescription>
                Click "Score Submission" to review student submissions, inspect multi-agent evidence, and record your score.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-12 text-center text-zinc-500">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-mono">Loading evaluation queue...</p>
                </div>
              ) : projects.length === 0 ? (
                <p className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No projects available for evaluation.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Project Name</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Human Score (30%)</th>
                        <th className="py-3 px-4">Evaluation State</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {projects.map((p) => {
                        const assignment = assignments.find((a) => a.project_id === p.id);
                        const isScored = assignment?.status === "scored" || p.status === "finalized";

                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-zinc-200">
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
                            <td className="py-3.5 px-4 font-mono font-bold">
                              {assignment?.human_score ? (
                                <span className="text-amber-400 font-mono">
                                  {assignment.human_score} pts
                                </span>
                              ) : isScored ? (
                                <span className="text-amber-400 font-mono">Recorded</span>
                              ) : (
                                <span className="text-zinc-600 font-mono">Pending</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {isScored ? (
                                <Badge variant="success" size="sm">
                                  SCORED
                                </Badge>
                              ) : (
                                <Badge variant="warning" size="sm">
                                  AWAITING GRADE
                                </Badge>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/projects/${p.id}/evaluation`}>
                                  <Button variant="outline" size="sm" title="Inspect AI evidence dossier">
                                    Dossier
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleOpenScoreModal(p)}
                                  leftIcon={<Sliders className="w-3.5 h-3.5" />}
                                >
                                  {isScored ? "Edit Score" : "Score Project"}
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

        {/* Modal: Submit / Calibrate Judge Score */}
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`Grade: ${selectedProject?.name}`}
          description="Evaluate the team's project against rubric standards. Human scoring contributes 30% to the final composite ranking."
        >
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={handleFillDemoJudgeFeedback}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Wand2 className="w-3 h-3" />
              <span>Insert Sample Feedback</span>
            </button>
          </div>

          <form onSubmit={handleSubmitScore} className="space-y-4">
            {/* Score Slider */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 font-mono uppercase tracking-wider">
                  Human Calibrated Score (0 - 100)
                </span>
                <span className="text-2xl font-mono font-bold text-amber-400">
                  {scorePayload.score}
                  <span className="text-xs text-zinc-500 font-normal"> / 100</span>
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={scorePayload.score}
                onChange={(e) =>
                  setScorePayload({ ...scorePayload, score: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0 (Unusable)</span>
                <span>50 (Fair)</span>
                <span>75 (Good)</span>
                <span>90+ (Exceptional)</span>
              </div>
            </div>

            <Textarea
              label="Qualitative Judge Feedback"
              placeholder="Detail strengths in architecture, code modularity, live UX execution, or critical deficiencies..."
              value={scorePayload.feedback || ""}
              onChange={(e) =>
                setScorePayload({ ...scorePayload, feedback: e.target.value })
              }
              rows={3}
            />

            <Textarea
              label="Override / Score Adjustment Rationale"
              placeholder="Optional: Justify variance if adjusting significantly above or below the baseline AI evaluation score..."
              value={scorePayload.override_reason || ""}
              onChange={(e) =>
                setScorePayload({ ...scorePayload, override_reason: e.target.value })
              }
              rows={2}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedProject(null)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmittingScore}>
                Submit Official Score
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
