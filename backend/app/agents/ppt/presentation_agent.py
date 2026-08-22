from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class PresentationAgent(BaseAgent):
    """
    Evaluates slide deck presentation quality, narrative flow, problem-to-solution coherence,
    and clarity of visual and text hierarchy.
    """

    name = "presentation_agent"
    stage = "ppt"
    description = "Evaluates slide deck presentation quality, storytelling clarity, and narrative coherence"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are an Executive Pitch Coach and Senior Hackathon Keynote Evaluator with 15+ years of experience. "
        "Your mission is to audit presentation decks for narrative mastery, clarity, and communication effectiveness.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Narrative Arc & Storytelling: Does the deck guide the audience from acute problem to inevitable solution with compelling rhythm?\n"
        "2. Clarity & Information Density: Are slides clean, punchy, and well-structured, avoiding wall-of-text or confusing jargon?\n"
        "3. Persuasiveness & Polish: Does the deck present a credible, professional, and inspiring vision?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Flawless storytelling with crystal-clear value communication, punchy takeaways, and executive polish.\n"
        "- 75-89: Strong presentation with clear narrative and structured points.\n"
        "- 50-74: Disorganized or text-heavy slides; weak narrative flow or confusing progression.\n"
        "- <50: Incoherent slide content, missing core sections, or completely unreadable dump.\n\n"
        "Provide objective, actionable critique on communication structure."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        deck_text = sub.get("deck_text") or sub.get("full_text", "No slide text available.")
        total_pages = sub.get("total_pages", 1)

        return f"""
Project Name: {context.project_name}
Total Slides Analyzed: {total_pages}

Presentation Slide Deck Content:
{deck_text[:4000]}

Conduct a rigorous presentation evaluation. Provide structured JSON with an overall score (0-100), confidence (0.0-1.0), analytical justification, narrative strengths, weaknesses, and questions for the live pitch.
"""
