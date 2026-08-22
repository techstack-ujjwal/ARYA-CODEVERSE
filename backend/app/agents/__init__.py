# Stage 1: Idea (4 agents)
from backend.app.agents.idea.idea_selection_agent import IdeaSelectionAgent, IdeaEvaluatorAgent
from backend.app.agents.idea.problem_impact_agent import ProblemImpactAgent
from backend.app.agents.idea.feasibility_agent import FeasibilityAgent
from backend.app.agents.idea.market_agent import MarketAgent

# Stage 2: PPT (3 agents)
from backend.app.agents.ppt.presentation_agent import PresentationAgent
from backend.app.agents.ppt.technical_architecture_agent import TechnicalArchitectureAgent, PPTEvaluatorAgent
from backend.app.agents.ppt.business_impact_agent import BusinessImpactAgent

# Stage 3: Product (5 agents)
from backend.app.agents.product.code_quality_agent import CodeQualityAgent, ProductEvaluatorAgent
from backend.app.agents.product.ui_ux_agent import UIUXAgent
from backend.app.agents.product.functionality_agent import FunctionalityAgent
from backend.app.agents.product.security_agent import SecurityAgent
from backend.app.agents.product.real_world_impact_agent import RealWorldImpactAgent

# Cross-Cutting (5 agents)
from backend.app.agents.shared.instant_feedback_agent import InstantFeedbackEngine, InstantFeedbackAgent
from backend.app.agents.shared.plagiarism_agent import PlagiarismAgent
from backend.app.agents.shared.cross_stage_consistency_agent import CrossStageConsistencyAgent
from backend.app.agents.shared.confidence_calibration_agent import ConfidenceCalibrationAgent
from backend.app.agents.shared.final_judge_agent import FinalJudgeAgent

# Orchestration Infra
from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.agents.orchestrator.llm_client import StructuredLLMClient
from backend.app.agents.orchestrator.runner import AgentRunner

__all__ = [
    # Idea
    "IdeaSelectionAgent",
    "IdeaEvaluatorAgent",
    "ProblemImpactAgent",
    "FeasibilityAgent",
    "MarketAgent",
    # PPT
    "PresentationAgent",
    "TechnicalArchitectureAgent",
    "PPTEvaluatorAgent",
    "BusinessImpactAgent",
    # Product
    "CodeQualityAgent",
    "ProductEvaluatorAgent",
    "UIUXAgent",
    "FunctionalityAgent",
    "SecurityAgent",
    "RealWorldImpactAgent",
    # Shared
    "InstantFeedbackEngine",
    "InstantFeedbackAgent",
    "PlagiarismAgent",
    "CrossStageConsistencyAgent",
    "ConfidenceCalibrationAgent",
    "FinalJudgeAgent",
    # Orchestrator
    "BaseAgent",
    "AgentInputContext",
    "StructuredLLMClient",
    "AgentRunner",
]
