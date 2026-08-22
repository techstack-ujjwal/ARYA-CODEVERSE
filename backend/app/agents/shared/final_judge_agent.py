from typing import Dict, Any, List, Optional
from backend.app.models.schemas.agent_schema import FinalSynthesisOutput
from backend.app.agents.orchestrator.llm_client import StructuredLLMClient


class FinalJudgeAgent:
    """
    Synthesizes multi-agent evaluations from Idea (20%), PPT (25%), and Product (55%)
    stages into an executive report with 70% AI scoring foundation and probing interview questions for judges.
    """

    def __init__(self, llm_client: Optional[StructuredLLMClient] = None):
        self.llm_client = llm_client or StructuredLLMClient()

    @classmethod
    def calculate_weighted_ai_score(
        cls,
        idea_score: float,
        ppt_score: float,
        product_score: float,
        rubric_weights: Optional[Dict[str, float]] = None,
    ) -> float:
        """Computes mathematically weighted AI score based on hackathon rubric weights."""
        weights = rubric_weights or {"idea": 0.20, "ppt": 0.25, "product": 0.55}
        w_idea = weights.get("idea", 0.20)
        w_ppt = weights.get("ppt", 0.25)
        w_product = weights.get("product", 0.55)

        total_weight = w_idea + w_ppt + w_product
        if total_weight == 0:
            total_weight = 1.0

        weighted_score = (
            (idea_score * w_idea) + (ppt_score * w_ppt) + (product_score * w_product)
        ) / total_weight

        return round(float(weighted_score), 2)

    async def synthesize_final_evaluation(
        self,
        project_name: str,
        idea_score: float,
        ppt_score: float,
        product_score: float,
        rubric_weights: Optional[Dict[str, float]] = None,
        stage_summaries: Optional[Dict[str, str]] = None,
    ) -> FinalSynthesisOutput:
        """Executes LLM synthesis for executive summary, strengths, weaknesses, and judge questions."""
        weighted_ai_score = self.calculate_weighted_ai_score(
            idea_score, ppt_score, product_score, rubric_weights
        )

        summaries = stage_summaries or {}
        system_prompt = (
            "You are the Chief Grand Jury Magistrate and Synthesis Judge for an elite international hackathon. "
            "Your mission is to synthesize multi-agent stage findings (Idea 20%, Presentation 25%, Product 55%) into "
            "an authoritative executive summary, highlighting core engineering strengths, critical weaknesses, "
            "and 3 high-yield probing interview questions for human judges during live pitch Q&A."
        )

        prompt = f"""
Project Name: {project_name}
Idea Stage Score (20% Weight): {idea_score}/100 — Summary: {summaries.get('idea', 'Completed')}
PPT Stage Score (25% Weight): {ppt_score}/100 — Summary: {summaries.get('ppt', 'Completed')}
Product Stage Score (55% Weight): {product_score}/100 — Summary: {summaries.get('product', 'Completed')}
Mathematically Weighted AI Score: {weighted_ai_score}/100

Synthesize these evaluations into an executive final report for human judges.
Return structured JSON with:
1. weighted_ai_score: {weighted_ai_score}
2. idea_score: {idea_score}
3. ppt_score: {ppt_score}
4. product_score: {product_score}
5. confidence: 0.95
6. executive_summary: comprehensive 2-3 paragraph synthesis
7. strengths: list of top 3-4 strengths
8. weaknesses: list of top 2-3 areas for improvement
9. suggested_judge_questions: list of 3 probing interview questions for human judges
"""
        return await self.llm_client.generate_structured(
            prompt=prompt,
            response_model=FinalSynthesisOutput,
            system_prompt=system_prompt,
            temperature=0.2,
        )
