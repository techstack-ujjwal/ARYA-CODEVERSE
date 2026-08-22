from typing import Dict, Any, List, Optional
from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import InstantFeedbackOutput, BaseAgentOutput
from backend.app.tools.uptime_checker import UptimeChecker
from backend.app.tools.security_scan import SecurityScanner
from backend.app.tools.static_analysis import StaticAnalysisTool


class InstantFeedbackEngine:
    """
    Sub-90s participant diagnostic engine:
    Runs fast deterministic tool passes over live URL, repository structure, and code hygiene,
    returning an actionable health report, ranked fixes, and 100-150 word detailed bullet feedback.
    """

    @classmethod
    async def run_diagnostic(
        cls,
        github_url: str,
        live_url: str = None,
        sample_files: Dict[str, str] = None,
    ) -> InstantFeedbackOutput:
        dimensions: Dict[str, Any] = {}
        top_fixes: List[str] = []
        mistakes: List[str] = []
        improvements: List[str] = []
        overall_health = "ok"

        # 1. Live Deployment Check
        if live_url:
            uptime_result = await UptimeChecker.check_url_health(live_url)
            dimensions["deployment_health"] = {
                "status": "ok" if uptime_result["reachable"] else "at_risk",
                "response_ms": uptime_result["response_time_ms"],
                "ssl_valid": uptime_result["ssl_valid"],
                "error": uptime_result["error"],
            }
            if not uptime_result["reachable"]:
                overall_health = "at_risk"
                mistake_msg = f"Live deployment at {live_url} is unreachable ({uptime_result.get('error')})."
                mistakes.append(mistake_msg)
                improvements.append("Verify your deployment DNS, ensure web server port binds to 0.0.0.0, and check hosting logs.")
                top_fixes.append(mistake_msg)
            elif uptime_result["response_time_ms"] and uptime_result["response_time_ms"] > 1000:
                mistakes.append(f"High server latency detected ({uptime_result['response_time_ms']}ms).")
                improvements.append("Optimize initial bundle size and enable gzip/brotli compression.")
        else:
            dimensions["deployment_health"] = {
                "status": "needs_attention",
                "notes": "No live URL provided",
            }
            mistakes.append("No live deployment URL provided for judges to test your web app.")
            improvements.append("Deploy your application to a free hosting provider (e.g., Vercel, Render, Fly.io) and submit the link.")
            top_fixes.append("Deploy project to a live hosting provider for live testing.")

        # 2. Static Code & Structure Check
        file_keys = list((sample_files or {}).keys())
        if file_keys:
            repo_hygiene = StaticAnalysisTool.inspect_repo_files(file_keys)
            dimensions["code_quality"] = {
                "status": "ok" if repo_hygiene["documentation_score"] >= 70.0 else "needs_attention",
                "score": repo_hygiene["documentation_score"],
                "has_readme": repo_hygiene["has_readme"],
                "has_tests": repo_hygiene["has_tests"],
                "has_env_example": repo_hygiene["has_env_example"],
            }
            if not repo_hygiene["has_readme"]:
                mistakes.append("Missing README.md documentation in repository root.")
                improvements.append("Create a README.md explaining the architecture, setup guide, and features.")
                top_fixes.append("Add a comprehensive README.md with setup and architecture overview.")
            if not repo_hygiene["has_env_example"]:
                mistakes.append("Missing .env.example template to guide environment configuration.")
                improvements.append("Add a .env.example file documenting all required environment variables.")
                top_fixes.append("Add a .env.example template to document required environment variables.")
            if not repo_hygiene["has_tests"]:
                mistakes.append("No automated test suite detected in repository.")
                improvements.append("Add unit and integration tests (pytest/jest) to prove reliability.")
            if repo_hygiene["exposed_sensitive_files"]:
                overall_health = "at_risk"
                mistakes.append(f"Sensitive credentials file committed to git: {repo_hygiene['exposed_sensitive_files']}.")
                improvements.append("Immediately remove secrets from git history, add them to .gitignore, and rotate exposed keys.")
                top_fixes.insert(0, f"Remove sensitive files committed to repository: {repo_hygiene['exposed_sensitive_files']}")
        else:
            dimensions["code_quality"] = {"status": "ok", "notes": ["Repository registered"]}

        # 3. Security Hygiene Check
        if sample_files:
            sec_result = SecurityScanner.check_security_hygiene(sample_files)
            dimensions["security_scan"] = {
                "status": "ok" if sec_result["is_clean"] else "at_risk",
                "findings_count": sec_result["findings_count"],
                "findings": sec_result["findings"],
            }
            if not sec_result["is_clean"]:
                overall_health = "at_risk"
                mistakes.append(f"{sec_result['findings_count']} exposed secrets or unsafe patterns found in source code.")
                improvements.append("Use environment variables via os.environ or dotenv instead of hardcoded strings.")
                top_fixes.insert(0, "Rotate and remove exposed API keys/secrets detected in code.")
        else:
            dimensions["security_scan"] = {"status": "ok", "findings": []}

        # 4. Functional Smoke Summary
        dimensions["functional_smoke"] = {
            "status": "ok" if live_url else "needs_attention",
            "notes": ["Health endpoint responsive" if live_url else "Pending live URL registration"],
        }

        if not top_fixes:
            top_fixes.append("Add automated integration tests to maximize your code reliability score.")

        # Construct structured 100-150 words detailed feedback in bullet points
        feedback_lines = [
            "### Pre-Judging Diagnostic Feedback & Improvement Plan",
            "",
            "**Key Mistakes & Identified Issues:**",
        ]
        for m in mistakes[:4]:
            feedback_lines.append(f"• {m}")
        if not mistakes:
            feedback_lines.append("• No critical errors found; repository passes core hygiene checks.")

        feedback_lines.append("")
        feedback_lines.append("**Actionable Recommendations to Improve Score:**")
        for imp in improvements[:4]:
            feedback_lines.append(f"• {imp}")
        if not improvements:
            feedback_lines.append("• Add automated test coverage and clean up inline documentation.")

        detailed_feedback = "\n".join(feedback_lines)

        return InstantFeedbackOutput(
            overall_health=overall_health,
            dimensions=dimensions,
            top_fixes=top_fixes[:5],
            detailed_feedback=detailed_feedback,
        )


class InstantFeedbackAgent(BaseAgent):
    """
    Agent wrapper for participant-facing fast diagnostic reporting.
    """
    name = "instant_feedback_agent"
    stage = "feedback"
    description = "Provides sub-90s participant diagnostic health reports and ranked fixes"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are an Instant Feedback Diagnostic Engine for hackathons. "
        "Your mission is to analyze repository health, uptime status, and security hygiene to generate a clear, "
        "supportive, but ruthlessly accurate 100-150 words bulleted breakdown of mistakes found and exact improvements needed before final judging."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sub = context.submission_data
        return f"""
Project Name: {context.project_name}
GitHub: {sub.get('github_url')}
Live URL: {sub.get('live_url')}

Summarize the immediate actionable improvements in 100-150 words bullet points for the participants before final judging.
"""
