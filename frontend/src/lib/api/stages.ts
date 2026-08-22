import { api } from "./client";
import {
  IdeaEvaluationResult,
  PPTEvaluationResult,
  ProductEvaluationResult,
  ExtractedClaim,
} from "@/types/api";

export const StagesAPI = {
  // --- Stage 1: Idea ---
  submitIdea: async (projectId: string, payload: Record<string, any>) => {
    const res = await api.post<{ project_id: string; submission_id: string; status: string }>(
      `/projects/${projectId}/idea`,
      payload
    );
    return res.data;
  },

  evaluateIdea: async (projectId: string) => {
    const res = await api.post<{ project_id: string; stage: string; status: string }>(
      `/projects/${projectId}/idea/evaluate`
    );
    return res.data;
  },

  getIdeaEvaluation: async (projectId: string) => {
    const res = await api.get<IdeaEvaluationResult>(`/projects/${projectId}/idea/evaluation`);
    return res.data;
  },

  // --- Stage 2: PPT Deck ---
  uploadPPT: async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.upload<{ project_id: string; submission_id: string; total_pages: number }>(
      `/projects/${projectId}/ppt/upload`,
      formData
    );
    return res.data;
  },

  evaluatePPT: async (projectId: string) => {
    const res = await api.post<{ project_id: string; stage: string; status: string }>(
      `/projects/${projectId}/ppt/evaluate`
    );
    return res.data;
  },

  getPPTClaims: async (projectId: string) => {
    const res = await api.get<ExtractedClaim[]>(`/projects/${projectId}/ppt/claims`);
    return res.data;
  },

  getPPTEvaluation: async (projectId: string) => {
    const res = await api.get<PPTEvaluationResult>(`/projects/${projectId}/ppt/evaluation`);
    return res.data;
  },

  // --- Stage 3: Product ---
  registerProduct: async (
    projectId: string,
    payload: { github_url?: string; live_url?: string; [key: string]: any }
  ) => {
    const res = await api.post<{ project_id: string; github_url?: string; live_url?: string }>(
      `/projects/${projectId}/product/register`,
      payload
    );
    return res.data;
  },

  evaluateProduct: async (projectId: string) => {
    const res = await api.post<{ project_id: string; stage: string; status: string }>(
      `/projects/${projectId}/product/evaluate`
    );
    return res.data;
  },

  getProductEvaluation: async (projectId: string) => {
    const res = await api.get<ProductEvaluationResult>(`/projects/${projectId}/product/evaluation`);
    return res.data;
  },
};
