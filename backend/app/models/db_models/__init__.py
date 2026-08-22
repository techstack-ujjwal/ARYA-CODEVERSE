from backend.app.models.db_models.base import Base, TimestampMixin, utc_now
from backend.app.models.db_models.models import (
    Hackathon,
    Project,
    Submission,
    Claim,
    Evaluation,
    Evidence,
    FeedbackReport,
    JudgeAssignment,
    FinalResult,
    PlagiarismFlag,
)

__all__ = [
    "Base",
    "TimestampMixin",
    "utc_now",
    "Hackathon",
    "Project",
    "Submission",
    "Claim",
    "Evaluation",
    "Evidence",
    "FeedbackReport",
    "JudgeAssignment",
    "FinalResult",
    "PlagiarismFlag",
]
