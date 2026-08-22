from datetime import datetime, timezone
import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String,
    Text,
    Float,
    Integer,
    ForeignKey,
    JSON,
    DateTime,
    Index,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.db_models.base import Base, TimestampMixin, utc_now


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Hackathon(Base, TimestampMixin):
    __tablename__ = "hackathons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rubric_weights: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=lambda: {"idea": 0.20, "ppt": 0.25, "product": 0.55},
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(32), default="active", nullable=False, index=True
    )  # draft, active, evaluation, finalized
    submission_deadline: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )

    # Relationships
    projects: Mapped[List["Project"]] = relationship(
        "Project", back_populates="hackathon", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("status IN ('draft', 'active', 'evaluation', 'finalized')", name="check_hackathon_status"),
    )


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    hackathon_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    members: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), default="idea", nullable=False, index=True
    )  # idea, ppt, product, evaluating, judged, finalized
    github_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    live_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Relationships
    hackathon: Mapped["Hackathon"] = relationship("Hackathon", back_populates="projects")
    submissions: Mapped[List["Submission"]] = relationship(
        "Submission", back_populates="project", cascade="all, delete-orphan"
    )
    claims: Mapped[List["Claim"]] = relationship(
        "Claim", back_populates="project", cascade="all, delete-orphan"
    )
    evaluations: Mapped[List["Evaluation"]] = relationship(
        "Evaluation", back_populates="project", cascade="all, delete-orphan"
    )
    feedback_reports: Mapped[List["FeedbackReport"]] = relationship(
        "FeedbackReport", back_populates="project", cascade="all, delete-orphan"
    )
    judge_assignments: Mapped[List["JudgeAssignment"]] = relationship(
        "JudgeAssignment", back_populates="project", cascade="all, delete-orphan"
    )
    final_result: Mapped[Optional["FinalResult"]] = relationship(
        "FinalResult", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    plagiarism_flags: Mapped[List["PlagiarismFlag"]] = relationship(
        "PlagiarismFlag", back_populates="project", cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint("hackathon_id", "name", name="uq_hackathon_project_name"),
        Index("ix_project_hackathon_status", "hackathon_id", "status"),
        CheckConstraint("status IN ('idea', 'ppt', 'product', 'evaluating', 'judged', 'finalized')", name="check_project_status"),
    )


class Submission(Base, TimestampMixin):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stage: Mapped[str] = mapped_column(
        String(32), nullable=False, index=True
    )  # idea, ppt, product
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    submitted_by: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="submissions")

    __table_args__ = (
        UniqueConstraint("project_id", "stage", name="uq_project_submission_stage"),
        Index("ix_submission_project_stage", "project_id", "stage"),
        CheckConstraint("stage IN ('idea', 'ppt', 'product')", name="check_submission_stage"),
    )


class Claim(Base, TimestampMixin):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    origin_stage: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # idea, ppt
    claim_type: Mapped[str] = mapped_column(
        String(64), default="feature", nullable=False, index=True
    )  # architecture, feature, scalability, security
    claim_text: Mapped[str] = mapped_column(Text, nullable=False)
    verification_status: Mapped[str] = mapped_column(
        String(32), default="unverified", nullable=False, index=True
    )  # unverified, verified, partially_verified, contradicted
    verification_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="claims")

    __table_args__ = (
        Index("ix_claim_project_status", "project_id", "verification_status"),
        CheckConstraint("verification_status IN ('unverified', 'verified', 'partially_verified', 'contradicted')", name="check_claim_status"),
    )


class Evaluation(Base, TimestampMixin):
    __tablename__ = "evaluations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stage: Mapped[str] = mapped_column(
        String(32), nullable=False, index=True
    )  # idea, ppt, product, final
    agent_name: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)
    model_used: Mapped[str] = mapped_column(String(64), default="default", nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="evaluations")
    evidence_items: Mapped[List["Evidence"]] = relationship(
        "Evidence", back_populates="evaluation", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_evaluation_project_stage_agent", "project_id", "stage", "agent_name"),
        CheckConstraint("score >= 0.0 AND score <= 100.0", name="check_evaluation_score_range"),
        CheckConstraint("confidence >= 0.0 AND confidence <= 1.0", name="check_evaluation_confidence_range"),
    )


class Evidence(Base, TimestampMixin):
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    evaluation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    evidence_type: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
    )  # static_analysis, security_scan, browser_automation, claim_verification, web_search
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    tool_used: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="evidence_items")

    __table_args__ = (
        Index("ix_evidence_eval_type", "evaluation_id", "evidence_type"),
    )


class FeedbackReport(Base, TimestampMixin):
    __tablename__ = "feedback_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    github_url: Mapped[str] = mapped_column(String(512), nullable=False)
    live_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    overall_health: Mapped[str] = mapped_column(
        String(32), default="needs_attention", nullable=False, index=True
    )  # ok, needs_attention, at_risk
    dimensions: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    top_fixes: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="feedback_reports")

    __table_args__ = (
        CheckConstraint("overall_health IN ('ok', 'needs_attention', 'at_risk')", name="check_feedback_health"),
    )


class JudgeAssignment(Base, TimestampMixin):
    __tablename__ = "judge_assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    judge_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    human_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), default="assigned", nullable=False, index=True
    )  # assigned, scored, flagged

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="judge_assignments")

    __table_args__ = (
        UniqueConstraint("judge_id", "project_id", name="uq_judge_project_assignment"),
        CheckConstraint("human_score IS NULL OR (human_score >= 0.0 AND human_score <= 100.0)", name="check_judge_score_range"),
    )


class FinalResult(Base, TimestampMixin):
    __tablename__ = "final_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    hackathon_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("hackathons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ai_score: Mapped[float] = mapped_column(Float, nullable=False)
    human_score: Mapped[float] = mapped_column(Float, nullable=False)
    final_score: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="final_result")

    __table_args__ = (
        Index("ix_final_result_hackathon_rank", "hackathon_id", "final_score"),
        CheckConstraint("ai_score >= 0.0 AND ai_score <= 100.0", name="check_final_ai_score"),
        CheckConstraint("human_score >= 0.0 AND human_score <= 100.0", name="check_final_human_score"),
        CheckConstraint("final_score >= 0.0 AND final_score <= 100.0", name="check_final_total_score"),
    )


class PlagiarismFlag(Base, TimestampMixin):
    __tablename__ = "plagiarism_flags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    matched_source: Mapped[str] = mapped_column(String(512), nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    matched_snippets: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(
        String(32), default="flagged", nullable=False, index=True
    )  # flagged, reviewed, dismissed

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="plagiarism_flags")

    __table_args__ = (
        Index("ix_plagiarism_project_similarity", "project_id", "similarity_score"),
        CheckConstraint("similarity_score >= 0.0 AND similarity_score <= 1.0", name="check_similarity_score_range"),
        CheckConstraint("status IN ('flagged', 'reviewed', 'dismissed')", name="check_plagiarism_status"),
    )
