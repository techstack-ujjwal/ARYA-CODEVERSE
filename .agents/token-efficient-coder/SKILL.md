---
name: token-efficient-coder
description: Enforces high token efficiency, concise communication, and clean modular code architecture without sacrificing code quality or test coverage.
---

# Token-Efficient Engineering Protocol

1. **Concise Communication**:
   - Zero boilerplate explanations, zero filler pleasantries.
   - Present status, diffs, code decisions, and questions directly.

2. **Precise File & Context Operations**:
   - Use targeted line ranges (`StartLine`/`EndLine`) when viewing or editing files.
   - Avoid re-printing entire files when making modular updates.
   - Rely on persistent skills and structured modules instead of repeated context re-injection.

3. **High-Quality, Modular Code Standards**:
   - Strict typing (Pydantic v2, Python type hints).
   - DRY (Don't Repeat Yourself) architecture with clean separation of concerns:
     `api/` -> `services/` -> `agents/` -> `tools/` -> `models/` -> `db/`.
   - Comprehensive error handling and edge-case resilience (tenacity retries, Pydantic validation).
