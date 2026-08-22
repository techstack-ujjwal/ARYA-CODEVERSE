import { api } from "./client";
import { Hackathon, PlagiarismFlag } from "@/types/api";

export interface CreateHackathonPayload {
  name: string;
  description?: string;
  rubric_weights?: {
    idea?: number;
    ppt?: number;
    product?: number;
    [key: string]: any;
  };
  status?: string;
  submission_deadline?: string;
}

export const AdminAPI = {
  listHackathons: async () => {
    const res = await api.get<Hackathon[]>("/admin/hackathons");
    return res.data;
  },

  getHackathon: async (id: string) => {
    const res = await api.get<Hackathon>(`/admin/hackathons/${id}`);
    return res.data;
  },

  createHackathon: async (payload: CreateHackathonPayload) => {
    const res = await api.post<Hackathon>("/admin/hackathons", payload);
    return res.data;
  },

  updateHackathon: async (id: string, payload: Partial<CreateHackathonPayload>) => {
    const res = await api.patch<Hackathon>(`/admin/hackathons/${id}`, payload);
    return res.data;
  },

  getPlagiarismFlags: async (hackathonId?: string) => {
    const query = hackathonId ? `?hackathon_id=${encodeURIComponent(hackathonId)}` : "";
    const res = await api.get<PlagiarismFlag[]>(`/admin/analytics/plagiarism-flags${query}`);
    return res.data;
  },
};
