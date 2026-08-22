import { api } from "./client";
import {
  EvaluationSummary,
  EvidenceItem,
  ConsistencyMetrics,
} from "@/types/api";

export const EvaluationAPI = {
  getSummary: async (projectId: string) => {
    const res = await api.get<EvaluationSummary>(`/projects/${projectId}/evaluation/summary`);
    return res.data;
  },

  getEvidence: async (projectId: string, stage?: string) => {
    const query = stage ? `?stage=${encodeURIComponent(stage)}` : "";
    const res = await api.get<EvidenceItem[]>(`/projects/${projectId}/evaluation/evidence${query}`);
    return res.data;
  },

  getConsistency: async (projectId: string) => {
    const res = await api.get<ConsistencyMetrics>(`/projects/${projectId}/evaluation/consistency`);
    return res.data;
  },
};
