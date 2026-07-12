"""Configuration for the BayanFi AI service."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../../../.env",
        extra="ignore",
    )

    # Service
    app_name: str = "BayanFi AI Service"
    environment: str = "development"
    port: int = 8000

    # Google Gemini (free tier — recommended)
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-flash-lite-latest"

    # OpenAI (paid)
    openai_api_key: str | None = None
    openai_model: str = "gpt-4-turbo-preview"

    # Ollama (local)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "mistral"
    use_ollama: bool = False

    # Thresholds
    duplicate_similarity_threshold: float = 0.90
    fraud_high_risk_threshold: float = 70.0


@lru_cache
def get_settings() -> Settings:
    return Settings()
