import { api } from "./client";
import { LeaderboardEntry } from "@/types/api";

export const FinalizationAPI = {
  computeFinalScore: async (projectId: string, weights?: { ai_weight?: number; human_weight?: number }) => {
    const res = await api.post<{
      project_id: string;
      ai_score: number;
      human_score: number;
      final_score: number;
      formula: string;
    }>(`/finalization/${projectId}/compute`, weights || {});
    return res.data;
  },

  getLeaderboard: async (hackathonId?: string) => {
    const query = hackathonId ? `?hackathon_id=${encodeURIComponent(hackathonId)}` : "";
    const res = await api.get<LeaderboardEntry[]>(`/finalization/leaderboard${query}`);
    return res.data;
  },
};
