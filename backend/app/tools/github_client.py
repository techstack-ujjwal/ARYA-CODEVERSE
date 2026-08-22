import os
import re
import shutil
import tempfile
from typing import Dict, Any, List, Optional
import httpx
from git import Repo
from loguru import logger
from backend.app.core.config import settings


class GitHubClientTool:
    """
    Deterministic GitHub analysis tool:
    - Safe ephemeral repository cloning into isolated sandbox directory
    - Pulls commit count, spread, and contributor metadata via GitHub REST API
    - Analyzes commit timeline hygiene (flags single last-minute dump commits)
    - Extracts file tree, repository language distribution, and sizes
    """

    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "AI-Hackathon-Evaluation-Engine",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def parse_repo_url(self, github_url: str) -> Optional[tuple]:
        """Extracts (owner, repo) from GitHub URL."""
        match = re.search(r"github\.com/([^/]+)/([^/]+)", github_url)
        if match:
            owner = match.group(1)
            repo = match.group(2).rstrip(".git")
            return owner, repo
        return None

    async def get_repo_metadata(self, github_url: str) -> Dict[str, Any]:
        """Fetches live metadata from GitHub REST API."""
        parsed = self.parse_repo_url(github_url)
        if not parsed:
            return {"error": "Invalid GitHub repository URL", "is_valid": False}
        
        owner, repo_name = parsed
        api_base = f"https://api.github.com/repos/{owner}/{repo_name}"
        headers = self._get_headers()

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                # 1. Fetch Repository Details
                repo_resp = await client.get(api_base, headers=headers)
                if repo_resp.status_code != 200:
                    return {
                        "is_valid": False,
                        "status_code": repo_resp.status_code,
                        "error": f"GitHub API error: {repo_resp.text}",
                    }
                repo_data = repo_resp.json()

                # 2. Fetch Commits (up to 100)
                commits_resp = await client.get(f"{api_base}/commits?per_page=100", headers=headers)
                commits = commits_resp.json() if commits_resp.status_code == 200 and isinstance(commits_resp.json(), list) else []

                # 3. Fetch Contributors
                contrib_resp = await client.get(f"{api_base}/contributors", headers=headers)
                contributors = contrib_resp.json() if contrib_resp.status_code == 200 and isinstance(contrib_resp.json(), list) else []

                # 4. Fetch Languages
                lang_resp = await client.get(f"{api_base}/languages", headers=headers)
                languages = lang_resp.json() if lang_resp.status_code == 200 and isinstance(lang_resp.json(), dict) else {}

                # Analyze commit hygiene
                commit_count = len(commits)
                contributor_count = len(contributors)
                is_single_dump = commit_count <= 2
                
                return {
                    "is_valid": True,
                    "owner": owner,
                    "repo_name": repo_name,
                    "stars": repo_data.get("stargazers_count", 0),
                    "forks": repo_data.get("forks_count", 0),
                    "open_issues": repo_data.get("open_issues_count", 0),
                    "default_branch": repo_data.get("default_branch", "main"),
                    "description": repo_data.get("description", ""),
                    "created_at": repo_data.get("created_at"),
                    "updated_at": repo_data.get("updated_at"),
                    "pushed_at": repo_data.get("pushed_at"),
                    "total_commits_sampled": commit_count,
                    "total_contributors": contributor_count,
                    "contributors": [c.get("login") for c in contributors[:10] if isinstance(c, dict)],
                    "languages": languages,
                    "is_single_commit_dump": is_single_dump,
                    "commit_hygiene": "poor" if is_single_dump else ("fair" if commit_count < 10 else "good"),
                }
            except Exception as e:
                logger.error(f"Error fetching GitHub metadata for {github_url}: {e}")
                return {"is_valid": False, "error": str(e)}

    def clone_sandbox(self, github_url: str, max_depth: int = 1) -> Dict[str, Any]:
        """
        Clones repository into an ephemeral temporary sandbox directory.
        Returns sandbox path, file tree list, and cleanup callback.
        """
        temp_dir = tempfile.mkdtemp(prefix="hackathon_eval_")
        try:
            # Clone with shallow depth for speed and resource protection
            Repo.clone_from(github_url, temp_dir, depth=max_depth)
            
            # Extract file tree
            file_tree = []
            total_size_bytes = 0
            for root, _, files in os.walk(temp_dir):
                if ".git" in root:
                    continue
                for f in files:
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, temp_dir).replace("\\", "/")
                    size = os.path.getsize(full_path)
                    total_size_bytes += size
                    file_tree.append({"path": rel_path, "size": size})

            def cleanup():
                try:
                    shutil.rmtree(temp_dir, ignore_errors=True)
                except Exception:
                    pass

            return {
                "success": True,
                "sandbox_path": temp_dir,
                "file_tree": file_tree,
                "total_files": len(file_tree),
                "total_size_kb": round(total_size_bytes / 1024, 2),
                "cleanup": cleanup,
            }
        except Exception as e:
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass
            return {"success": False, "error": str(e), "file_tree": []}
