from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Configurações lidas de variáveis de ambiente ou do arquivo `.env`."""

    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    # Origens do frontend permitidas no CORS (separadas por vírgula).
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    model_path: Path = BASE_DIR / "model" / "modelo_nb.joblib"
    model_version: str = "1.0"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
