import { api } from "./client";
import { Project, ProjectStatus } from "@/types/api";

export interface CreateProjectPayload {
  hackathon_id: string;
  name: string;
  description?: string;
  github_url?: string;
  live_url?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  github_url?: string;
  live_url?: string;
  status?: string;
}

export const ProjectsAPI = {
  list: async (hackathonId?: string) => {
    const query = hackathonId ? `?hackathon_id=${encodeURIComponent(hackathonId)}` : "";
    const res = await api.get<Project[]>(`/projects${query}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },

  create: async (payload: CreateProjectPayload) => {
    const res = await api.post<Project>("/projects", payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateProjectPayload) => {
    const res = await api.patch<Project>(`/projects/${id}`, payload);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ project_id: string }>(`/projects/${id}`);
    return res.data;
  },

  addMember: async (id: string, userId: string) => {
    const res = await api.post<Project>(`/projects/${id}/team-members`, { user_id: userId });
    return res.data;
  },

  getStatus: async (id: string) => {
    const res = await api.get<ProjectStatus>(`/projects/${id}/status`);
    return res.data;
  },
};
