import hashlib
from typing import Dict, Any, List, Optional
from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput, EvidenceItem


class PlagiarismAgent(BaseAgent):
    """
    Detects code plagiarism, boilerplate clones, template dumps, and cross-project duplication
    using AST structural fingerprinting and similarity analysis.
    """

    name = "plagiarism_agent"
    stage = "evaluation"
    description = "Detects code duplication, boilerplate dumps, and similarity against other submissions"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Lead Anti-Cheating and Code Authenticity Investigator for major hackathons with 15+ years of experience. "
        "Your mission is to rigorously detect plagiarized submissions, uncredited boilerplate clones, and last-minute monolithic code dumps.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Code Originality (0-100): Is the core business logic uniquely authored during the hackathon or copied from open-source repos/templates?\n"
        "2. Commit Timeline & Hygiene: Does the git commit history exhibit natural incremental development vs a single massive last-minute commit dump?\n"
        "3. Template Differentiation: If starter templates were used, did the team build significant novel functionality on top?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Completely authentic, bespoke code with natural commit distribution across the hackathon window.\n"
        "- 75-89: Original build with legitimate use of standard third-party libraries and clear custom architecture.\n"
        "- 50-74: High proportion of generic tutorial template with minimal original engineering added.\n"
        "- <50: Direct clone of an existing GitHub repo passed off as original work; zero authenticity.\n\n"
        "Deliver clear forensic evidence of code originality and flag clone signatures."
    )

    @staticmethod
    def compute_code_hash(code_str: str) -> str:
        """Computes SHA-256 normalized hash of code."""
        normalized = "".join(code_str.split())
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    def build_prompt(self, context: AgentInputContext) -> str:
        repo_data = context.submission_data
        github_url = repo_data.get("github_url", "Not provided")
        files_info = repo_data.get("files_summary", "Standard repo layout")

        return f"""
Project Name: {context.project_name}
GitHub URL: {github_url}
Repository Details: {files_info}

Analyze if this submission is an original hackathon build vs a cloned template/fork.
Return structured JSON with:
1. Authenticity score (0-100, where 100 is completely original, <50 is high risk of cloning)
2. Confidence (0.0-1.0)
3. Summary of plagiarism and commit hygiene assessment
4. Identified similarities or template signatures
"""
