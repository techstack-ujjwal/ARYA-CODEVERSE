from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.models.schemas.agent_schema import BaseAgentOutput


class SecurityAgent(BaseAgent):
    """
    Evaluates application security posture: flags exposed credentials, insecure patterns,
    injection vulnerabilities, and missing authentication barriers based on deterministic security scans.
    """

    name = "security_agent"
    stage = "product"
    description = "Evaluates security posture, exposed credentials, authentication boundaries, and vulnerability scans"
    output_schema = BaseAgentOutput

    system_prompt = (
        "You are a Senior Principal Application Security (AppSec) Engineer and Threat Modeler with 15+ years of experience. "
        "Your mission is to audit codebase security posture and classify vulnerabilities based on deterministic scan evidence.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. Credential & Secret Management: Are API keys, database passwords, private keys, or tokens committed into git history?\n"
        "2. Attack Surface & Authentication: Are critical API endpoints protected with JWT/Bearer verification, RBAC, and rate limits?\n"
        "3. Injection & Input Sanitization: Are SQL queries parameterized, inputs validated with strict schemas, and SSRF protections active?\n\n"
        "SCORING RIGOR GUIDELINES:\n"
        "- 90-100: Clean security scan with zero exposed secrets, strict input validation, parameterized queries, and robust auth bounds.\n"
        "- 75-89: Generally secure with standard security controls; minor non-critical posture warnings.\n"
        "- 50-74: Security oversights: missing auth on sensitive routes, loose CORS, or unvalidated user inputs.\n"
        "- <50: Critical security disaster: hardcoded cloud/database/OpenAI keys, SQL injection vulnerabilities, or zero auth.\n\n"
        "Explain the severity and remediation steps for all identified security findings."
    )

    def build_prompt(self, context: AgentInputContext) -> str:
        sec_evidence = "\n".join([
            f"[{e.evidence_type.upper()}] from {e.tool_used} ({e.source}):\n  Summary: {e.summary}\n  Details: {e.content}"
            for e in context.tools_evidence
            if e.tool_used == "security_scanner" or e.evidence_type == "security_scan"
        ]) or "No security scanner evidence provided."

        return f"""
Project Name: {context.project_name}

Deterministic Security Scanner Findings:
{sec_evidence}

Evaluate the security posture and vulnerability exposure. Return structured JSON with an overall score (0-100), confidence (0.0-1.0), analytical justification, critical security risks, and remediation questions.
"""
