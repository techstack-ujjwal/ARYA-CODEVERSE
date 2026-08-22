import { api } from "./client";
import { JudgeAssignment } from "@/types/api";

export interface JudgeScorePayload {
  score: number;
  feedback?: string;
  override_reason?: string;
}

export const JudgingAPI = {
  getAssignedProjects: async () => {
    const res = await api.get<JudgeAssignment[]>("/judging/assigned-projects");
    return res.data;
  },

  submitScore: async (projectId: string, payload: JudgeScorePayload) => {
    const res = await api.post<{
      assignment_id: string;
      project_id: string;
      judge_id: string;
      human_score: number;
      status: string;
    }>(`/judging/${projectId}/score`, payload);
    return res.data;
  },
};
