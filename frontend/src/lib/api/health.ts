import { api } from "./client";
import { HealthCheckResponse, AgentHealthResponse, AuthenticatedUser } from "@/types/api";

export const HealthAPI = {
  check: async () => {
    const res = await api.get<HealthCheckResponse>("/health");
    return res.data;
  },

  checkAgents: async () => {
    const res = await api.get<AgentHealthResponse>("/health/agents");
    return res.data;
  },
};

export const AuthAPI = {
  getMe: async () => {
    const res = await api.get<AuthenticatedUser>("/auth/me");
    return res.data;
  },
};
