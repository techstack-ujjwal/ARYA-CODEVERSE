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
    DATABASE_URL: str = "sqlite+aiosqlite:///./eval_engine.db"
    SYNC_DATABASE_URL: str = "sqlite:///./eval_engine.db"


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
