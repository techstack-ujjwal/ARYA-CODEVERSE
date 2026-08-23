import time
from abc import ABC, abstractmethod
from typing import Type, TypeVar, Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from loguru import logger
from backend.app.models.schemas.agent_schema import (
    BaseAgentOutput,
    EvidenceItem,
    ExtractedClaim,
)
from backend.app.agents.orchestrator.llm_client import StructuredLLMClient

OutputType = TypeVar("OutputType", bound=BaseAgentOutput)


class AgentInputContext(BaseModel):
    """Encapsulates all input context provided to an evaluation agent."""
    model_config = ConfigDict(extra="ignore")

    project_id: str
    project_name: str
    stage: str
    submission_data: Dict[str, Any] = Field(default_factory=dict)
    tools_evidence: List[EvidenceItem] = Field(default_factory=list)
    prior_claims: List[ExtractedClaim] = Field(default_factory=list)
    rubric_weights: Dict[str, float] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class BaseAgent(ABC):
    """
    Abstract Base Agent defining unified lifecycle, prompt orchestration,
    and structured output validation for all evaluation agents.
    """

    name: str = "base_agent"
    stage: str = "generic"
    description: str = "Base evaluation agent"
    output_schema: Type[BaseAgentOutput] = BaseAgentOutput
    system_prompt: str = (
        "You are an expert, highly rigorous technical judge for hackathon projects. "
        "Evaluate strictly based on claims, verified evidence, and rubric criteria.\n"
        "STRICT JUDGING MANDATE: If a project submission is empty, non-functional, superficial, buzzword salad, broken, or plagiarized, you are FULLY AUTHORIZED AND EXPECTED TO ASSIGN SCORES AS LOW AS 0 TO 30. "
        "DO NOT inflate grades out of politeness. Provide objective, unyielding scores and actionable technical feedback.\n\n"
        "FEEDBACK STRUCTURE MANDATE: Your feedback MUST BE 100% PROJECT-SPECIFIC (referencing the exact project name, repository modules, specific architectural components, APIs, and features). Never provide generic boilerplate.\n"
        "Format your output reasoning strictly using structured bullet points in these markdown sections:\n"
        "### 📌 Rubric Criteria Evaluation\n"
        "• **Criteria 1 (Score/100)**: Project-specific technical assessment\n"
        "• **Criteria 2 (Score/100)**: Project-specific technical assessment\n\n"
        "### ✅ Verified Project Strengths\n"
        "• Concrete strength verified in project code/architecture\n"
        "• Concrete strength verified in project code/architecture\n\n"
        "### ⚠️ Identified Weaknesses & Gaps\n"
        "• Specific technical flaw, missing error boundary, or vulnerability\n"
        "• Specific technical flaw or risk\n\n"
        "### 💡 Actionable Recommendations (3 Points)\n"
        "1. **Title 1**: Concrete actionable fix referencing project code\n"
        "2. **Title 2**: Concrete actionable fix referencing project code\n"
        "3. **Title 3**: Concrete actionable fix referencing project code"
    )

    def __init__(self, llm_client: Optional[StructuredLLMClient] = None):
        self.llm_client = llm_client or StructuredLLMClient()

    @abstractmethod
    def build_prompt(self, context: AgentInputContext) -> str:
        """Constructs the domain-specific prompt for this agent."""
        pass

    async def evaluate(self, context: AgentInputContext) -> BaseAgentOutput:
        """
        Executes evaluation with execution telemetry, structured output parsing,
        and evidence merging.
        """
        start_time = time.perf_counter()
        logger.info(f"[{self.name}] Starting evaluation for project {context.project_id} (Stage: {self.stage})")

        prompt = self.build_prompt(context)

        # Call structured LLM client
        output: BaseAgentOutput = await self.llm_client.generate_structured(
            prompt=prompt,
            response_model=self.output_schema,
            system_prompt=self.system_prompt,
            temperature=0.2,
        )

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(
            f"[{self.name}] Completed in {elapsed_ms}ms with score {output.score} (Confidence: {output.confidence})"
        )

        # Attach telemetry metrics
        if not output.metrics:
            output.metrics = {}
        output.metrics["execution_time_ms"] = elapsed_ms
        output.metrics["agent_name"] = self.name
        output.metrics["stage"] = self.stage

        # Merge tool-grounded evidence if provided in context
        if context.tools_evidence:
            existing_sources = {e.source for e in output.evidence}
            for tool_ev in context.tools_evidence:
                if tool_ev.source not in existing_sources:
                    output.evidence.append(tool_ev)

        return output
