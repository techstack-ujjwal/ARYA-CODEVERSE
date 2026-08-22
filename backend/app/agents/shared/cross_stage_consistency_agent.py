from typing import List, Dict, Any
from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput, ExtractedClaim


class CrossStageConsistencyAgent(BaseAgent):
    """
    Audits promises vs. deliverables:
    Cross-references claims extracted from Idea & PPT stages against Product implementation evidence.
    """

    name = "cross_stage_consistency_agent"
    stage = "evaluation"
    description = "Diffs Idea & PPT claims against Product evidence to verify implementation integrity"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Lead Integrity & Cross-Stage Consistency Auditor with 15+ years of software auditing experience. "
        "Your mission is to perform a rigorous diff between what was promised in the Idea/PPT stages and what was actually built in the Product stage.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Architectural Fulfillment: Was the claimed stack, database design, and pipeline actually implemented in code?\n"
        "2. Feature Claim Integrity: Did the team deliver the key features claimed in their slides, or are they completely missing?\n"
        "3. Exaggeration vs Delivery Penalty: Penalize teams that made grandiose presentation claims but delivered empty stubs.\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: 90%+ of extracted claims verified with concrete code/runtime evidence; exceptional integrity.\n"
        "- 75-89: Majority of core claims delivered with honest scope adjustments.\n"
        "- 50-74: Significant divergence; major promised features are unbuilt or mere placeholders.\n"
        "- <50: Total disconnect between presentation hype and actual product; vaporware.\n\n"
        "Classify each claim as Verified, Partially Verified, or Contradicted based strictly on evidence."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        claims = context.prior_claims
        claims_str = "\n".join([f"- [{c.origin_stage.upper()} / {c.claim_type}] {c.claim_text}" for c in claims]) or "No prior claims extracted."

        evidence_str = "\n".join([f"- [{e.evidence_type}] {e.summary} ({e.source})" for e in context.tools_evidence]) or "No implementation evidence."

        return f"""
Project Name: {context.project_name}

Prior Claims Extracted from Idea & PPT Stages:
{claims_str}

Product Implementation Evidence:
{evidence_str}

Evaluate whether the claimed architecture, core features, and scalability promises are backed by real implementation evidence.
Return structured JSON with:
1. Consistency score (0-100)
2. Confidence (0.0-1.0)
3. Summary of claim verification coverage
4. Reasoning detailing which claims are satisfied vs missing
5. Risks and probing questions for human judges
"""
