from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool
from loguru import logger
from backend.app.core.config import settings
from backend.app.models.db_models.base import Base

engine_kwargs = {"echo": False}
if "sqlite" in settings.DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["poolclass"] = NullPool

async_engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)



async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


async def init_db():
    """Initializes the database schema if needed."""
    if "sqlite" in settings.DATABASE_URL:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized.")

