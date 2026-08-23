from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.models.db_models.models import Project, Submission
from backend.app.db.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    def __init__(self, session: AsyncSession):
        super().__init__(Project, session)

    async def get_with_details(self, project_id: str) -> Optional[Project]:
        result = await self.session.execute(
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.submissions),
                selectinload(Project.evaluations),
                selectinload(Project.claims),
                selectinload(Project.feedback_reports),
                selectinload(Project.final_result),
            )
        )
        return result.scalars().first()

    async def list_by_hackathon(
        self, hackathon_id: Optional[str] = None, owner_id: Optional[str] = None
    ) -> List[Project]:
        stmt = select(Project).order_by(Project.created_at.desc())
        if hackathon_id and hackathon_id != "all":
            stmt = stmt.where(Project.hackathon_id == hackathon_id)
        if owner_id:
            stmt = stmt.where(Project.owner_id == owner_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def add_member(self, project_id: str, user_id: str) -> Optional[Project]:
        project = await self.get_by_id(project_id)
        if not project:
            return None
        current_members = list(project.members) if project.members else []
        if user_id not in current_members:
            current_members.append(user_id)
            project.members = current_members
            await self.session.commit()
            await self.session.refresh(project)
        return project

    async def update_stage_status(self, project_id: str, new_status: str) -> Optional[Project]:
        return await self.update(project_id, status=new_status)


class SubmissionRepository(BaseRepository[Submission]):
    def __init__(self, session: AsyncSession):
        super().__init__(Submission, session)

    async def get_by_project_and_stage(
        self, project_id: str, stage: str
    ) -> Optional[Submission]:
        result = await self.session.execute(
            select(Submission).where(
                Submission.project_id == project_id,
                Submission.stage == stage,
            )
        )
        return result.scalars().first()
