"""Configuration for the BayanFi AI service."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../../../.env",  # root .env from apps/ai-service/
        extra="ignore"
    )

    # Service
    app_name: str = "BayanFi AI Service"
    environment: str = "development"
    port: int = 8000

    # LLM backends
    openai_api_key: str | None = None
    openai_model: str = "gpt-4-turbo-preview"

    # Ollama (local — no data leaves the machine, strong privacy pitch)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "mistral"
    use_ollama: bool = True  # default to Ollama; set USE_OLLAMA=false to use OpenAI

    # Thresholds
    duplicate_similarity_threshold: float = 0.90
    fraud_high_risk_threshold: float = 70.0


@lru_cache
def get_settings() -> Settings:
    return Settings()
