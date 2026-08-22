import pytest
from sqlalchemy.engine.url import make_url
from backend.app.core.config import Settings


@pytest.mark.parametrize(
    "raw_input,expected_scheme",
    [
        ("", "sqlite+aiosqlite"),
        ("   ", "sqlite+aiosqlite"),
        ('"postgresql+asyncpg://postgres:pass@db.example.com:5432/postgres"', "postgresql+asyncpg"),
        ("'postgresql+asyncpg://postgres:pass@db.example.com:5432/postgres'", "postgresql+asyncpg"),
        ('"postgres://user:pass@host:5432/db"', "postgresql+asyncpg"),
        ("DATABASE_URL=postgres://user:pass@host:5432/db", "postgresql+asyncpg"),
        ('DATABASE_URL="postgres://user:pass@host:5432/db"', "postgresql+asyncpg"),
        ("DATABASE_URL='postgres://user:pass@host:5432/db'\n", "postgresql+asyncpg"),
        ("postgres://user:my#pass@host:5432/db", "postgresql+asyncpg"),
        ("postgres://user:my?pass@host:5432/db", "postgresql+asyncpg"),
        ("postgres://user:my/pass@host:5432/db", "postgresql+asyncpg"),
        ("postgres://user:my%pass@host:5432/db", "postgresql+asyncpg"),
        ("postgres://user:my[pass]word@host:5432/db", "postgresql+asyncpg"),
        ("postgres://user:p@ss:w@rd#123?foo@host:5432/db", "postgresql+asyncpg"),
        ("postgres://postgres.abc_def:P@ssw0rd!#%&@aws-0.pooler.supabase.com:6543/postgres?sslmode=require", "postgresql+asyncpg"),
        ("postgresql://postgres:P@ssw0rd123@db.supabase.co:5432/postgres", "postgresql+asyncpg"),
        ("sqlite+aiosqlite:///./eval_engine.db", "sqlite+aiosqlite"),
        ("sqlite:///./eval_engine.db", "sqlite+aiosqlite"),
        ("postgres://user:p%40ssword@dpg-c1234-a.oregon-postgres.render.com:5432/dbname_xyz", "postgresql+asyncpg"),
        ("postgres://user:p@ssword@dpg-c1234-a/dbname_xyz", "postgresql+asyncpg"),
        ("postgresql+asyncpg://postgres:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true", "postgresql+asyncpg"),
    ],
)
def test_async_database_url_sanitization(raw_input, expected_scheme):
    settings = Settings(DATABASE_URL=raw_input)
    assert settings.DATABASE_URL
    url_obj = make_url(settings.DATABASE_URL)
    assert url_obj.drivername == expected_scheme


@pytest.mark.parametrize(
    "raw_input,expected_scheme",
    [
        ("", "sqlite"),
        ("   ", "sqlite"),
        ('"postgresql+asyncpg://postgres:pass@db.example.com:5432/postgres"', "postgresql"),
        ("'postgresql+asyncpg://postgres:pass@db.example.com:5432/postgres'", "postgresql"),
        ('"postgres://user:pass@host:5432/db"', "postgresql"),
        ("SYNC_DATABASE_URL=postgres://user:pass@host:5432/db", "postgresql"),
        ('SYNC_DATABASE_URL="postgres://user:pass@host:5432/db"', "postgresql"),
        ("postgres://user:p@ss:w@rd#123?foo@host:5432/db", "postgresql"),
        ("sqlite+aiosqlite:///./eval_engine.db", "sqlite"),
        ("sqlite:///./eval_engine.db", "sqlite"),
    ],
)
def test_sync_database_url_sanitization(raw_input, expected_scheme):
    settings = Settings(SYNC_DATABASE_URL=raw_input)
    assert settings.SYNC_DATABASE_URL
    url_obj = make_url(settings.SYNC_DATABASE_URL)
    assert url_obj.drivername == expected_scheme
