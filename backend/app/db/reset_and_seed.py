"""
Database Clean & Re-Seed Script.
Wipes all orphan test records and populates the exact 5 pristine seed projects.

Usage:
    python -m backend.app.db.reset_and_seed
"""
import asyncio
from loguru import logger
from sqlalchemy import delete
from backend.app.db.session import AsyncSessionLocal, init_db
from backend.app.models.db_models import (
    Hackathon,
    Project,
    Submission,
    Claim,
    Evaluation,
    Evidence,
    FeedbackReport,
    JudgeAssignment,
    FinalResult,
    PlagiarismFlag,
)
from backend.app.db.seed import seed_database


async def reset_and_seed():
    logger.info("Connecting to database for clean reset...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # Delete in reverse foreign key order
        logger.info("Purging stale records...")
        await session.execute(delete(Evidence))
        await session.execute(delete(Evaluation))
        await session.execute(delete(Claim))
        await session.execute(delete(FeedbackReport))
        await session.execute(delete(JudgeAssignment))
        await session.execute(delete(FinalResult))
        await session.execute(delete(PlagiarismFlag))
        await session.execute(delete(Submission))
        await session.execute(delete(Project))
        await session.execute(delete(Hackathon))
        await session.commit()
        logger.info("All old records purged successfully.")

    logger.info("Re-seeding 5 pristine projects...")
    await seed_database()
    logger.info("Database reset and re-seed complete!")


if __name__ == "__main__":
    asyncio.run(reset_and_seed())
