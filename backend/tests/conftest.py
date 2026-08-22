import pytest
from backend.app.core.config import settings
from backend.app.db.session import init_db


@pytest.fixture(autouse=True)
async def setup_test_db():
    """Setup test database schema when using SQLite."""
    if "sqlite" in settings.DATABASE_URL:
        await init_db()


