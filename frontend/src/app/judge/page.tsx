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
      description="The Human Judge Portal is restricted to assigned Hackathon Judges and Evaluators. Switch to Judge mode in the top right to inspect evidence dossiers and assign human rubric scores (30% weight)."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full bg-[#FAF8F5] text-[#18181B]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E3D8]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E3D8] flex items-center justify-center text-[#18181B] shadow-2xs">
                <Award className="w-4.5 h-4.5 text-[#3A4B86]" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#18181B] tracking-tight">
                JuryX Human Judge Evaluation Portal
              </h1>
            </div>
            <p className="text-xs text-[#52525B] mt-1">
              Evaluate assigned hackathon submissions, inspect grounded AI evidence dossiers, and submit calibrated scores (30% weight).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="font-mono text-xs"
            >
              Refresh Queue
            </Button>
          </div>
        </div>

        {/* Assigned Projects Table / Card Slots */}
        <div className="my-8">
          <div className="nude-card p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E3D8]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-[#18181B]">Evaluation Queue</h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#DDE4F8] text-[#3A4B86]">
                    {scoredCount} / {projects.length} SCORED
                  </span>
                </div>
                <p className="text-xs text-[#52525B] mt-0.5">
                  Click &quot;Score Project&quot; to review student submissions, inspect multi-agent evidence dossiers, and calibrate your human rubric rating.
                </p>
              </div>

              {/* Interactive UI Toggle */}
              <Toggle
                checked={pendingOnly}
                onChange={setPendingOnly}
                size="sm"
                variant="default"
                label={
                  <span className="text-xs font-mono text-[#18181B]">
                    Pending Only ({pendingCount})
                  </span>
                }
              />
            </div>

            <div>
              {isLoading ? (
                <div className="py-12 text-center text-[#71717A]">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-[#18181B]" />
                  <p className="text-xs font-mono">Loading evaluation queue...</p>
                </div>
              ) : displayProjects.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#71717A] font-mono">
                  {pendingOnly ? "All assigned projects have been scored!" : "No projects available for evaluation."}
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#E8E3D8] bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#E8E3D8] text-[#71717A] font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Project Name</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Human Score (30%)</th>
                        <th className="py-3 px-4">Evaluation State</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E3D8]">
                      {displayProjects.map((p) => {
                        const assignment = assignments.find((a) => a.project_id === p.id);
                        const isScored = assignment?.status === "scored" || p.status === "finalized";

                        return (
                          <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-[#18181B]">
                              <div className="flex flex-col">
                                <span>{p.name}</span>
                                <span className="text-[11px] text-[#71717A] line-clamp-1 font-normal">
                                  {p.description || "No description"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                  p.status === "finalized"
                                    ? "bg-[#D8EAD9] text-[#2D5A36]"
                                    : "bg-[#DDE4F8] text-[#3A4B86]"
                                }`}
                              >
                                {p.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold">
                              {assignment?.human_score ? (
                                <span className="text-[#2D5A36]">
                                  {assignment.human_score.toFixed(1)} / 100
                                </span>
                              ) : (
                                <span className="text-[#71717A] font-normal">Not Graded</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {isScored ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#2D5A36] font-mono font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Scored
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#71717A] font-mono">
                                  <Clock className="w-3.5 h-3.5" />
                                  Pending Review
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/projects/${p.id}/evaluation`}>
                                  <Button variant="ghost" size="sm" className="font-mono text-xs">
                                    Dossier
                                  </Button>
                                </Link>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleOpenScoreModal(p)}
                                  className="bg-[#18181B] hover:bg-[#27272A] text-white font-mono font-bold text-xs"
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
            </div>
          </div>
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
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E3D8]">
              <span className="text-xs font-mono text-[#52525B] uppercase font-bold">Qualitative Calibration</span>
              <button
                type="button"
                onClick={handleFillDemoJudgeFeedback}
                className="flex items-center gap-1 text-[11px] text-[#18181B] hover:text-black bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#D6CFBE] px-2 py-0.5 rounded cursor-pointer font-mono font-semibold"
              >
                <Wand2 className="w-3 h-3 text-[#3A4B86]" />
                <span>Fill Sample Rubric</span>
              </button>
            </div>

            {/* Score Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#52525B] font-bold">Human Rubric Score:</span>
                <span className="text-xl font-bold text-[#2D5A36]">
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
                className="w-full bg-[#E8E3D8] rounded-lg h-2"
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

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E3D8]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedProject(null)}
                className="font-mono text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmittingScore}
                className="bg-[#18181B] hover:bg-[#27272A] text-white font-mono font-bold text-xs"
              >
                Submit Official Rating
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
