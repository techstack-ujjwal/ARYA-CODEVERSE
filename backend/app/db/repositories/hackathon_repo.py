from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models.db_models.models import Hackathon
from backend.app.db.repositories.base import BaseRepository


class HackathonRepository(BaseRepository[Hackathon]):
    def __init__(self, session: AsyncSession):
        super().__init__(Hackathon, session)

    async def get_active_hackathons(self) -> List[Hackathon]:
        result = await self.session.execute(
            select(Hackathon).where(Hackathon.status == "active")
        )
        return list(result.scalars().all())
