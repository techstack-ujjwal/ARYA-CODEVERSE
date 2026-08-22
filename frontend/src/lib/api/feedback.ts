import { api } from "./client";
import { FeedbackReportData } from "@/types/api";

export const FeedbackAPI = {
  submit: async (
    projectId: string,
    payload: {
      github_url?: string;
      live_url?: string;
      sample_files?: Record<string, string>;
    }
  ) => {
    const res = await api.post<FeedbackReportData>(
      `/projects/${projectId}/feedback/submit`,
      payload
    );
    return res.data;
  },

  getLatest: async (projectId: string) => {
    const res = await api.get<FeedbackReportData>(`/projects/${projectId}/feedback/latest`);
    return res.data;
  },
};
