import os
import ast
from typing import Dict, Any, List


class StaticAnalysisTool:
    """
    Deterministic static code analysis tool:
    - File structure & line count analysis
    - Documentation completeness (README, license, .env.example)
    - Python AST cyclomatic complexity & syntax verification
    """

    @staticmethod
    def analyze_python_code(code_string: str) -> Dict[str, Any]:
        """Analyzes Python code snippet using AST."""
        try:
            tree = ast.parse(code_string)
            functions = [node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))]
            classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
            imports = [node.names[0].name for node in ast.walk(tree) if isinstance(node, ast.Import)]
            
            # Basic cyclomatic complexity estimate (counting branching nodes: If, For, While, Try, ExceptHandler)
            branch_nodes = sum(
                1 for node in ast.walk(tree)
                if isinstance(node, (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With, ast.Assert))
            )
            complexity_score = "low" if branch_nodes <= 10 else ("medium" if branch_nodes <= 25 else "high")

            return {
                "valid_syntax": True,
                "function_count": len(functions),
                "class_count": len(classes),
                "functions": functions[:10],
                "classes": classes[:10],
                "branch_nodes": branch_nodes,
                "estimated_complexity": complexity_score,
                "import_count": len(imports),
            }
        except SyntaxError as e:
            return {
                "valid_syntax": False,
                "error": f"Syntax error at line {e.lineno}: {e.msg}",
            }

    @staticmethod
    def inspect_repo_files(file_list: List[str]) -> Dict[str, Any]:
        """Checks presence of standard repository files and structure hygiene."""
        lower_files = [f.lower().replace("\\", "/") for f in file_list]

        has_readme = any("readme" in f for f in lower_files)
        has_license = any("license" in f for f in lower_files)
        has_env_example = any(".env.example" in f or "example.env" in f for f in lower_files)
        has_tests = any("test" in f for f in lower_files)
        has_dockerfile = any("dockerfile" in f for f in lower_files)
        has_git_ignore = any(".gitignore" in f for f in lower_files)

        # Flag committed secrets / sensitive files
        exposed_sensitive_files = [
            f for f in lower_files
            if f.endswith(".env") or f.endswith("id_rsa") or f.endswith(".pem") or "credentials.json" in f
        ]

        doc_score = 100.0
        if not has_readme:
            doc_score -= 40.0
        if not has_env_example:
            doc_score -= 20.0
        if not has_license:
            doc_score -= 10.0
        if not has_tests:
            doc_score -= 20.0
        if not has_git_ignore:
            doc_score -= 10.0

        return {
            "has_readme": has_readme,
            "has_license": has_license,
            "has_env_example": has_env_example,
            "has_tests": has_tests,
            "has_dockerfile": has_dockerfile,
            "has_git_ignore": has_git_ignore,
            "exposed_sensitive_files": exposed_sensitive_files,
            "documentation_score": max(0.0, doc_score),
            "total_files": len(file_list),
        }
