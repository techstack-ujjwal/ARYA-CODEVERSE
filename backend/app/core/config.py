import json
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # Server Configuration
    PROJECT_NAME: str = "AI Hackathon Evaluation Engine"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = ["*"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres.ihanvppukqyfvtargpqp:Data%40123%40321@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?ssl=require"
    SYNC_DATABASE_URL: str = "postgresql://postgres.ihanvppukqyfvtargpqp:Data%40123%40321@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

    @staticmethod
    def _sanitize_url(v: str, is_async: bool = True) -> str:
        if v is None:
            return "sqlite+aiosqlite:///./eval_engine.db" if is_async else "sqlite:///./eval_engine.db"
        url = str(v).strip().strip("\"'").strip()
        
        # Strip accidental key prefix (e.g. DATABASE_URL=...)
        if "=" in url and not url.startswith("sqlite") and "://" in url:
            prefix_part, rest = url.split("=", 1)
            if "DATABASE_URL" in prefix_part.upper() or "SYNC_DATABASE_URL" in prefix_part.upper():
                url = rest.strip().strip("\"'").strip()

        if not url:
            return "sqlite+aiosqlite:///./eval_engine.db" if is_async else "sqlite:///./eval_engine.db"

        # Handle SQLite
        if url.startswith("sqlite"):
            if is_async and not url.startswith("sqlite+aiosqlite://"):
                url = "sqlite+aiosqlite://" + url[len("sqlite://"):] if url.startswith("sqlite://") else url
            elif not is_async and url.startswith("sqlite+aiosqlite://"):
                url = "sqlite://" + url[len("sqlite+aiosqlite://"):]
            return url

        # Auto-rewrite Supabase direct domain (IPv6-only) to Supabase connection pooler (IPv4 compatible on Render/cloud)
        import re
        m_supa = re.search(r'@db\.([a-zA-Z0-9]+)\.supabase\.co(?::\d+)?', url)
        if m_supa:
            project_ref = m_supa.group(1)
            url = re.sub(r'@db\.[a-zA-Z0-9]+\.supabase\.co(:\d+)?', r'@aws-0-ap-southeast-1.pooler.supabase.com:5432', url)
            url = re.sub(r'://postgres(?:\.[a-zA-Z0-9]+)?:', f'://postgres.{project_ref}:', url)

        if "://" not in url:
            return url

        raw_scheme, remainder = url.split("://", 1)
        raw_scheme = raw_scheme.lower().strip()

        if is_async:
            if raw_scheme in ("postgres", "postgresql"):
                scheme = "postgresql+asyncpg"
            elif raw_scheme.startswith("postgres"):
                scheme = raw_scheme.replace("postgres://", "postgresql+asyncpg://").replace("postgres+", "postgresql+")
                if not ("+" in scheme):
                    scheme = "postgresql+asyncpg"
            else:
                scheme = raw_scheme
        else:
            if raw_scheme in ("postgres", "postgresql+asyncpg"):
                scheme = "postgresql"
            elif raw_scheme.startswith("postgresql+"):
                scheme = "postgresql"
            elif raw_scheme == "postgres":
                scheme = "postgresql"
            else:
                scheme = raw_scheme

        query_str = ""
        if "?" in remainder:
            remainder, query_str = remainder.split("?", 1)
            query_str = "?" + query_str

        path_str = ""
        if "/" in remainder:
            authority, path_str = remainder.split("/", 1)
            path_str = "/" + path_str
        else:
            authority = remainder

        if "@" in authority:
            import urllib.parse
            last_at_idx = authority.rfind("@")
            creds = authority[:last_at_idx]
            host_port = authority[last_at_idx + 1:]

            if ":" in creds:
                user, password = creds.split(":", 1)
                enc_user = urllib.parse.quote(urllib.parse.unquote(user), safe="")
                enc_password = urllib.parse.quote(urllib.parse.unquote(password), safe="")
                clean_authority = f"{enc_user}:{enc_password}@{host_port}"
            else:
                enc_user = urllib.parse.quote(urllib.parse.unquote(creds), safe="")
                clean_authority = f"{enc_user}@{host_port}"
        else:
            clean_authority = authority

        # Format SSL parameter correctly for asyncpg vs psycopg
        if is_async:
            if "sslmode=" in query_str:
                query_str = query_str.replace("sslmode=", "ssl=")
            elif "ssl=" not in query_str and "sqlite" not in scheme:
                sep = "&" if query_str else "?"
                query_str = f"{query_str}{sep}ssl=require"
        else:
            if "ssl=" in query_str and "sslmode=" not in query_str:
                query_str = query_str.replace("ssl=", "sslmode=")
            elif "sslmode=" not in query_str and "sqlite" not in scheme:
                sep = "&" if query_str else "?"
                query_str = f"{query_str}{sep}sslmode=require"

        return f"{scheme}://{clean_authority}{path_str}{query_str}"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def sanitize_database_url(cls, v: str) -> str:
        return cls._sanitize_url(v, is_async=True)

    @field_validator("SYNC_DATABASE_URL", mode="before")
    @classmethod
    def sanitize_sync_database_url(cls, v: str) -> str:
        return cls._sanitize_url(v, is_async=False)


    # Clerk Auth (Supports standard Clerk & Next.js frontend variable names)
    CLERK_SECRET_KEY: str = ""
    CLERK_API_KEY: str = ""  # Alias for CLERK_SECRET_KEY
    CLERK_PUBLISHABLE_KEY: str = ""
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: str = ""  # Next.js frontend alias
    CLERK_WEBHOOK_SECRET: str = ""
    CLERK_JWKS_URL: str = ""
    CLERK_ISSUER: str = ""

    @property
    def get_clerk_secret_key(self) -> str:
        return self.CLERK_SECRET_KEY or self.CLERK_API_KEY

    @property
    def get_clerk_publishable_key(self) -> str:
        return self.CLERK_PUBLISHABLE_KEY or self.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

    # LLM Providers
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    # Tools & Search
    TAVILY_API_KEY: str = ""
    SERPAPI_KEY: str = ""
    GITHUB_TOKEN: str = ""

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Observability
    LANGSMITH_TRACING: str = "false"
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "hackathon-eval-engine"
    SENTRY_DSN: str = ""


settings = Settings()
