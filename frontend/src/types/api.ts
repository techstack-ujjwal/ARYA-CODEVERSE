export type UserRole = "participant" | "judge" | "admin";

export interface AuthenticatedUser {
  user_id: string;
  email?: string | null;
  role: UserRole;
  metadata?: Record<string, any>;
}

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string | null;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  environment: string;
  database: string;
}

export interface AgentHealthResponse {
  openai: string;
  gemini: string;
  tavily: string;
}

export interface Project {
  id: string;
  hackathon_id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  members: string[];
  status: string;
  github_url?: string | null;
  live_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectStatus {
  project_id: string;
  overall_status: string;
  stages: {
    idea: "pending" | "submitted" | "completed";
    ppt: "pending" | "submitted" | "completed";
    product: "pending" | "registered" | "completed";
    feedback: "none" | "generated";
    finalized: "pending" | "completed";
  };
}

export interface IdeaEvaluationResult {
  project_id: string;
  stage: "idea";
  score: number;
  confidence: number;
  reasoning: string;
  agents: Record<
    string,
    {
      score: number;
      confidence: number;
      reasoning: string;
    }
  >;
  evidence: Array<{
    type: string;
    source: string;
    summary: string;
  }>;
}

export interface ExtractedClaim {
  id?: string;
  claim_type: string;
  claim_text: string;
  verification_status: "verified" | "unverified" | "disproven" | "partially_verified";
  origin_stage: string;
}

export interface PPTEvaluationResult {
  project_id: string;
  stage: "ppt";
  score: number;
  confidence: number;
  agents: Record<
    string,
    {
      score: number;
      confidence: number;
      reasoning: string;
    }
  >;
}

export interface ProductEvaluationResult {
  project_id: string;
  stage: "product";
  score: number;
  confidence: number;
  agents: Record<
    string,
    {
      score: number;
      confidence: number;
      reasoning: string;
    }
  >;
  evidence: Array<{
    type: string;
    source: string;
    summary: string;
  }>;
}

export interface FeedbackDimension {
  status: "ok" | "needs_attention" | "at_risk";
  notes?: string[];
  response_ms?: number;
  failed_step?: string;
  findings?: string[];
  matched?: number;
  total_claimed?: number;
  commits?: number;
  contributors?: number;
  score?: number;
  [key: string]: any;
}

export interface FeedbackReportData {
  feedback_id?: string;
  project_id: string;
  overall_health: "ok" | "needs_attention" | "at_risk";
  dimensions: Record<string, FeedbackDimension>;
  top_fixes: string[];
  created_at?: string;
}

export interface TeacherFeedback {
  assignment_id: string;
  project_id: string;
  judge_id?: string | null;
  human_score?: number | null;
  comments?: string | null;
  override_reason?: string | null;
  status: "assigned" | "scored" | "pending";
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DetailedAgentEvaluation {
  id: string;
  agent_name: string;
  stage: "idea" | "ppt" | "product" | "shared" | string;
  score: number;
  confidence: number;
  reasoning: string;
  model_used?: string;
  created_at?: string | null;
  evidence?: Array<{
    id?: string;
    evidence_type: string;
    source: string;
    tool_used: string;
    content?: any;
    summary?: string;
  }>;
}

export interface EvaluationSummary {
  project_id: string;
  project_name: string;
  weighted_ai_score: number;
  breakdown: {
    idea_stage: { weight: number; score: number };
    ppt_stage: { weight: number; score: number };
    product_stage: { weight: number; score: number };
  };
  total_evaluations: number;
  agent_evaluations?: DetailedAgentEvaluation[];
  teacher_feedback?: TeacherFeedback | null;
}

export interface EvidenceItem {
  id: string;
  evidence_type: string;
  source: string;
  tool_used: string;
  content: Record<string, any>;
}

export interface ConsistencyMetrics {
  project_id: string;
  total_claims: number;
  verified_claims: number;
  verification_rate: number;
  claims: Array<{
    claim_text: string;
    claim_type: string;
    origin_stage: string;
    status?: string;
    verification_status?: string;
  }>;
}

export interface JudgeAssignment {
  assignment_id: string;
  project_id: string;
  judge_id?: string;
  human_score?: number | null;
  comments?: string | null;
  status: "assigned" | "scored";
  created_at?: string;
  updated_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  project_id: string;
  project_name: string;
  ai_score: number;
  human_score: number;
  final_score: number;
}

export interface Hackathon {
  id: string;
  name: string;
  description?: string | null;
  rubric_weights: {
    idea?: number;
    ppt?: number;
    product?: number;
    [key: string]: any;
  };
  status: "draft" | "active" | "judging" | "completed" | string;
  submission_deadline?: string | null;
  total_projects?: number;
  my_projects?: number;
  is_enrolled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlagiarismFlag {
  flag_id: string;
  project_id: string;
  project_name: string;
  matched_source: string;
  similarity_score: number;
  status: "flagged" | "reviewed" | "dismissed";
}
