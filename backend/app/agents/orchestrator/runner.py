import asyncio
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from loguru import logger

from backend.app.models.db_models.models import Evaluation, Evidence, Project
from backend.app.models.schemas.agent_schema import BaseAgentOutput
from backend.app.agents.orchestrator.base_agent import BaseAgent, AgentInputContext
from backend.app.db.repositories.project_repo import ProjectRepository


class AgentRunner:
    """
    Asynchronous runner for orchestrating multi-agent evaluations,
    evidence extraction, and persistence to PostgreSQL/SQLite.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_repo = ProjectRepository(session)

    async def execute_agents_concurrently(
        self,
        agents: List[BaseAgent],
        context: AgentInputContext,
    ) -> List[BaseAgentOutput]:
        """Runs multiple agents in parallel with asyncio.gather."""
        tasks = [agent.evaluate(context) for agent in agents]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return results

    async def save_evaluation_result(
        self,
        project_id: str,
        stage: str,
        agent_name: str,
        output: BaseAgentOutput,
        model_used: str = "default",
    ) -> Evaluation:
        """Persists agent evaluation scores, reasoning, and evidence items to DB."""
        evaluation = Evaluation(
            project_id=project_id,
            stage=stage,
            agent_name=agent_name,
            score=output.score,
            confidence=output.confidence,
            reasoning=output.reasoning,
            model_used=model_used,
        )
        self.session.add(evaluation)
        await self.session.flush()  # Obtain evaluation.id

        # Persist associated evidence records
        for ev in output.evidence:
            evidence_record = Evidence(
                evaluation_id=evaluation.id,
                evidence_type=ev.evidence_type,
                source=ev.source,
                content=ev.content,
                tool_used=ev.tool_used,
            )
            self.session.add(evidence_record)

        await self.session.commit()
        
        # Reload with evidence_items eagerly loaded
        result = await self.session.execute(
            select(Evaluation)
            .where(Evaluation.id == evaluation.id)
            .options(selectinload(Evaluation.evidence_items))
        )
        loaded_eval = result.scalars().first() or evaluation
        logger.info(f"Saved evaluation {loaded_eval.id} for project {project_id} (Score: {loaded_eval.score})")
        return loaded_eval

    async def run_stage_pipeline(
        self,
        project_id: str,
        stage: str,
        agents: List[BaseAgent],
        context: AgentInputContext,
    ) -> List[Evaluation]:
        """Runs all agents for a stage concurrently and saves all evaluations."""
        logger.info(f"Executing Stage Pipeline [{stage}] with {len(agents)} agents for project {project_id}")
        agent_outputs = await self.execute_agents_concurrently(agents, context)

        saved_evaluations: List[Evaluation] = []
        for agent, output in zip(agents, agent_outputs):
            saved_eval = await self.save_evaluation_result(
                project_id=project_id,
                stage=stage,
                agent_name=agent.name,
                output=output,
            )
            saved_evaluations.append(saved_eval)

        # Update project stage status
        await self.project_repo.update_stage_status(project_id, new_status=stage)
        return saved_evaluations
