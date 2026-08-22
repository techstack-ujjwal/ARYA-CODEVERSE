import re
from typing import Dict, Any, List


class SecurityScanner:
    """
    Fast, deterministic security scanner for hardcoded secrets, exposed API keys,
    and dangerous code patterns.
    """

    SECRET_PATTERNS = [
        ("AWS Access Key", re.compile(r"(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}")),
        ("OpenAI / API Key", re.compile(r"sk-[a-zA-Z0-9]{32,}")),
        ("GitHub Personal Access Token", re.compile(r"gh[pousr]_[a-zA-Z0-9]{36,}")),
        ("Generic Private Key", re.compile(r"-----BEGIN (?:RSA|OPENSSH|DSA|EC) PRIVATE KEY-----")),
        ("Hardcoded Password Assignment", re.compile(r"""(?:password|passwd|pwd|secret|api_key)\s*=\s*['"][a-zA-Z0-9@#$%^&+=_\-]{6,}['"]""", re.IGNORECASE)),
        ("Slack Bot Token", re.compile(r"xoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}")),
    ]

    @classmethod
    def scan_text_for_secrets(cls, text: str, source_identifier: str = "snippet") -> List[Dict[str, Any]]:
        """Scans string content for exposed credentials and secrets."""
        findings = []
        lines = text.splitlines()

        for line_num, line in enumerate(lines, start=1):
            for pattern_name, regex in cls.SECRET_PATTERNS:
                if regex.search(line):
                    findings.append({
                        "finding_type": "exposed_secret",
                        "severity": "CRITICAL",
                        "pattern": pattern_name,
                        "source": source_identifier,
                        "line_number": line_num,
                        "description": f"Potential {pattern_name} detected in {source_identifier}:{line_num}",
                    })
        return findings

    @classmethod
    def check_security_hygiene(cls, file_contents_map: Dict[str, str]) -> Dict[str, Any]:
        """Scans multiple repository files for critical security red flags."""
        all_findings = []
        for file_path, content in file_contents_map.items():
            findings = cls.scan_text_for_secrets(content, source_identifier=file_path)
            all_findings.extend(findings)

        is_clean = len(all_findings) == 0
        security_score = 100.0 - (len(all_findings) * 25.0)
        security_score = max(0.0, min(100.0, security_score))

        return {
            "is_clean": is_clean,
            "security_score": security_score,
            "findings_count": len(all_findings),
            "findings": all_findings[:10],
        }
