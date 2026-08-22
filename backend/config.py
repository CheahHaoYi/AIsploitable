import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"

class Settings(BaseModel):
    app_name: str = "CyberTriage AI (AIsploitable)"
    app_version: str = "0.1.0"
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    default_model: str = os.getenv("DEFAULT_MODEL", "gemma4:e2b")
    fallback_model: str = os.getenv("FALLBACK_MODEL", "gemma4:e4b")
    demo_mode: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    data_dir: Path = DATA_DIR

settings = Settings()
