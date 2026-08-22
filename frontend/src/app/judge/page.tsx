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

export default function JudgePortalPage() {
  const { role, setRole } = useAuth();
  const { toast, success, error } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Scoring Modal State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scorePayload, setScorePayload] = useState<JudgeScorePayload>({
    score: 88,
    feedback: "",
    override_reason: "",
  });
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);

  const loadData = async () => {
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
      score: existingAssign?.human_score || 88,
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

  const isUnauthorizedRole = role !== "judge" && role !== "admin";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Human Judge Portal
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Evaluate assigned submissions, inspect evidence dossiers, and submit calibrated human scores (30% weight).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isUnauthorizedRole ? "warning" : "success"} size="md">
            {role.toUpperCase()} MODE
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
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
                You are currently viewing as <span className="font-bold text-amber-400">Participant</span>. Switch to Judge role to submit human evaluations.
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRole("judge")}
              className="shrink-0"
            >
              Switch to Judge Role
            </Button>
          </div>
        </Card>
      )}

      {/* Projects for Evaluation Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Activity className="w-6 h-6 animate-spin mb-3 text-zinc-400" />
          <p className="text-xs font-mono">Loading assigned projects...</p>
        </div>
      ) : fetchError ? (
        <Card variant="subtle" className="border-rose-500/20 bg-rose-500/5 p-8 text-center my-6">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-200">Failed to Load Judging Queue</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">{fetchError}</p>
          <Button
            onClick={loadData}
            size="sm"
            variant="secondary"
            className="mt-4 gap-1.5"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </Card>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 my-8">
          <Award className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-zinc-300">No Projects Available for Judging</h4>
          <p className="text-[11px] text-zinc-500 mt-1">
            Projects registered in the hackathon will appear here for grading.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-8">
          {projects.map((project) => {
            const assignment = assignments.find((a) => a.project_id === project.id);
            const isScored = assignment && assignment.human_score !== null && assignment.human_score !== undefined;

            return (
              <Card
                key={project.id}
                className="flex flex-col justify-between p-5 bg-zinc-900/50 border-zinc-800"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant={isScored ? "success" : "warning"} size="sm">
                      {isScored ? `SCORED (${assignment.human_score} PTS)` : "PENDING SCORE"}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-zinc-100 line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 min-h-[32px]">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center gap-2">
                  <Button
                    onClick={() => handleOpenScoreModal(project)}
                    size="sm"
                    variant={isScored ? "secondary" : "primary"}
                    className="flex-1"
                    leftIcon={<Sliders className="w-3.5 h-3.5" />}
                  >
                    {isScored ? "Edit Score" : "Grade Project"}
                  </Button>

                  <Link href={`/projects/${project.id}/evaluation`}>
                    <Button variant="outline" size="sm" title="View Evidence Dossier">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Grade Project Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={`Judge Evaluation — ${selectedProject?.name}`}
        description="Provide a calibrated human score between 0.0 and 100.0, along with written feedback."
      >
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={handleFillDemoJudgeFeedback}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Wand2 className="w-3 h-3" />
            <span>Insert Sample Feedback</span>
          </button>
        </div>

        <form onSubmit={handleSubmitScore} className="space-y-5">
          {/* Score Slider & Presets */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                Human Judge Score (0 – 100)
              </label>
              <span className="text-xl font-mono font-black text-emerald-400">
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
                setScorePayload({ ...scorePayload, score: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            {/* Quick Score Preset Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-zinc-500 mr-1">Presets:</span>
              {[75, 85, 92, 98].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setScorePayload({ ...scorePayload, score: val })}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    scorePayload.score === val
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {val} pts
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Judge Feedback & Strengths"
            placeholder="Key strengths, code design notes, user interface impressions..."
            value={scorePayload.feedback || ""}
            onChange={(e) =>
              setScorePayload({ ...scorePayload, feedback: e.target.value })
            }
            rows={3}
          />

          <Textarea
            label="Score Calibration / Override Justification (Optional)"
            placeholder="Why you elevated or reduced points relative to the automated AI agent score..."
            value={scorePayload.override_reason || ""}
            onChange={(e) =>
              setScorePayload({ ...scorePayload, override_reason: e.target.value })
            }
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedProject(null)}
              disabled={isSubmittingScore}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingScore}>
              Submit Score
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
