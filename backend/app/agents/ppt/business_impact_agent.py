from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class BusinessImpactAgent(BaseAgent):
    """
    Evaluates business model sanity, go-to-market plan, monetization pathways,
    and commercial sustainability presented in the slide deck.
    """

    name = "business_impact_agent"
    stage = "ppt"
    description = "Evaluates business model realism, go-to-market strategy, and commercial viability"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Commercial Strategist and Venture Partner with 15+ years of startup scaling experience. "
        "Your mission is to evaluate the commercial viability, monetization mechanics, and market expansion potential presented in slide decks.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Business Model Realism: Is there a clear, credible revenue engine (SaaS, usage-based, marketplace, enterprise)?\n"
        "2. Go-To-Market (GTM) Strategy: Are customer acquisition channels realistically scoped with sensible unit economics?\n"
        "3. Market Expansion & Scalability: Can this business scale efficiently beyond initial early adopters?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Exceptional commercial roadmap with defensible unit economics and clear, scalable acquisition channels.\n"
        "- 75-89: Viable business model with sound monetization hypotheses.\n"
        "- 50-74: Naive revenue assumptions (e.g. 'we will run banner ads'), unrealistic pricing, or vague acquisition strategy.\n"
        "- <50: No commercial awareness, economically absurd model, or unviable cost structure.\n\n"
        "Provide incisive economic analysis and stress-test the business model."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        deck_text = sub.get("deck_text") or sub.get("full_text", "No slide text available.")

        return f"""
Project Name: {context.project_name}

Presentation Slide Deck Content:
{deck_text[:4000]}

Conduct a rigorous business and commercial viability evaluation. Return structured JSON with an overall score (0-100), confidence (0.0-1.0), analytical justification, financial/market risks, and questions for founders.
"""
