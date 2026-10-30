from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Primary provider
    google_api_key: str
    gemini_model: str = "gemini-3.8-flash"

    # Fallback provider
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"

    internal_api_key: str = ""
    allowed_origins: str = "http://localhost:5000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()