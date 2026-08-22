from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class EvidenceItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    evidence_type: str = Field(
        ...,
        description="Type of evidence: static_analysis, security_scan, browser_automation, claim_verification, web_search, rubric_analysis",
    )
    source: str = Field(..., description="File, URL, CLI output, or search query source")
    tool_used: str = Field(..., description="Deterministic tool or engine that produced evidence")
    content: Dict[str, Any] = Field(default_factory=dict, description="Raw or parsed structured findings")
    summary: str = Field(..., description="One-line human-readable summary of this finding")


class BaseAgentOutput(BaseModel):
    """
    Standardized Pydantic contract returned by EVERY evaluation agent.
    Guarantees consistent schema validation across all stages.
    """
    model_config = ConfigDict(extra="ignore")

    score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Evaluation score strictly between 0.0 and 100.0 based on rubric criteria",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence calibration score between 0.0 and 1.0",
    )
    summary: str = Field(..., description="Executive summary of the agent's evaluation")
    reasoning: str = Field(..., description="Detailed analytical justification grounded in evidence")
    evidence: List[EvidenceItem] = Field(
        default_factory=list,
        description="List of verified evidence items backing the score",
    )
    risks: List[str] = Field(
        default_factory=list,
        description="Identified technical, security, feasibility, or product risks",
    )
    questions: List[str] = Field(
        default_factory=list,
        description="Clarification questions for the team or human judges",
    )
    metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Key numerical or categorical metrics (e.g. cyclomatic complexity, response time)",
    )

    @field_validator("score")
    @classmethod
    def validate_score_precision(cls, v: float) -> float:
        return round(float(v), 2)

    @field_validator("confidence")
    @classmethod
    def validate_confidence_precision(cls, v: float) -> float:
        return round(float(v), 2)


class ExtractedClaim(BaseModel):
    claim_type: str = Field(
        default="feature",
        description="architecture, feature, scalability, security",
    )
    claim_text: str = Field(..., description="Specific verifiable claim extracted from Idea or PPT")
    origin_stage: str = Field(default="ppt", description="idea or ppt")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)


class IdeaEvaluationOutput(BaseAgentOutput):
    """Output schema for Idea stage evaluation."""
    uniqueness_score: float = Field(..., ge=0.0, le=100.0)
    problem_clarity_score: float = Field(..., ge=0.0, le=100.0)
    feasibility_score: float = Field(..., ge=0.0, le=100.0)
    market_differentiation_score: float = Field(..., ge=0.0, le=100.0)
    identified_competitors: List[str] = Field(default_factory=list)


class PPTEvaluationOutput(BaseAgentOutput):
    """Output schema for PPT stage evaluation."""
    presentation_quality_score: float = Field(..., ge=0.0, le=100.0)
    architecture_clarity_score: float = Field(..., ge=0.0, le=100.0)
    business_impact_score: float = Field(..., ge=0.0, le=100.0)
    extracted_claims: List[ExtractedClaim] = Field(default_factory=list)


class ProductEvaluationOutput(BaseAgentOutput):
    """Output schema for Product stage evaluation."""
    code_quality_score: float = Field(..., ge=0.0, le=100.0)
    functionality_score: float = Field(..., ge=0.0, le=100.0)
    ui_ux_score: float = Field(..., ge=0.0, le=100.0)
    security_score: float = Field(..., ge=0.0, le=100.0)
    real_world_impact_score: float = Field(..., ge=0.0, le=100.0)
    verified_claims_count: int = Field(default=0)
    total_claims_count: int = Field(default=0)


class InstantFeedbackOutput(BaseModel):
    """Output schema for fast participant diagnostic (<90s)."""
    model_config = ConfigDict(extra="ignore")

    overall_health: str = Field(..., description="ok | needs_attention | at_risk")
    dimensions: Dict[str, Any] = Field(
        ...,
        description="Status and findings for code_quality, deployment_health, functional_smoke, security_scan, docs, commit_hygiene",
    )
    top_fixes: List[str] = Field(
        ...,
        description="Ranked list of top 3-5 actionable fixes for participants",
    )
    detailed_feedback: Optional[str] = Field(
        default=None,
        description="Detailed bullet points (100-150 words) detailing mistakes found and actionable recommendations on how to improve",
    )


class FinalSynthesisOutput(BaseModel):
    """Output schema for Final Judge Synthesis."""
    model_config = ConfigDict(extra="ignore")

    weighted_ai_score: float = Field(..., ge=0.0, le=100.0)
    idea_score: float = Field(..., ge=0.0, le=100.0)
    ppt_score: float = Field(..., ge=0.0, le=100.0)
    product_score: float = Field(..., ge=0.0, le=100.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    executive_summary: str
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggested_judge_questions: List[str] = Field(default_factory=list)
