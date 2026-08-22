import math
from typing import Dict, Any, List, Optional
from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class ConfidenceCalibrationAgent(BaseAgent):
    """
    Calibrates evaluation confidence across multiple model outputs/providers.
    Detects score variance, flags high-divergence evaluations for human review,
    and computes a statistically calibrated consensus score.
    """

    name = "confidence_calibration_agent"
    stage = "evaluation"
    description = "Calibrates multi-model score agreement, detects variance, and computes statistical confidence"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are an Expert Statistical Calibration & Consensus Arbiter for AI multi-agent evaluation systems. "
        "Your mission is to analyze score distributions across multiple evaluation agents and providers, "
        "reconcile divergences, and determine an objective calibrated confidence score for human judges."
    )

    @classmethod
    def calibrate_scores(cls, scores: List[float]) -> Dict[str, Any]:
        """Computes mean, standard deviation, and calibrated confidence from a list of scores."""
        if not scores:
            return {"mean_score": 0.0, "std_dev": 0.0, "calibrated_confidence": 1.0, "requires_human_review": False}

        n = len(scores)
        mean_score = sum(scores) / n
        variance = sum((x - mean_score) ** 2 for x in scores) / n if n > 1 else 0.0
        std_dev = math.sqrt(variance)

        # Confidence drops as standard deviation increases
        # std_dev = 0 -> confidence 1.0; std_dev >= 20 -> confidence drops significantly
        calibrated_confidence = max(0.5, round(1.0 - (std_dev / 40.0), 2))
        requires_human_review = std_dev > 15.0  # High divergence flag

        return {
            "mean_score": round(mean_score, 2),
            "std_dev": round(std_dev, 2),
            "calibrated_confidence": calibrated_confidence,
            "requires_human_review": requires_human_review,
            "sample_size": n,
        }

    def build_prompt(self, context: AgentInputContext) -> str:
        scores_data = context.submission_data.get("agent_scores", [])
        return f"""
Project Name: {context.project_name}
Stage: {context.stage}
Agent Scores: {scores_data}

Analyze the evaluation score distribution and consensus. Provide structured JSON with:
1. Calibrated consensus score (0-100)
2. Statistical confidence (0.0-1.0)
3. Summary of inter-agent agreement/discrepancy
4. Recommendation on whether human judge intervention is required
"""
