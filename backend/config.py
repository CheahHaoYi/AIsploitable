import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"

class Settings(BaseModel):
    app_name: str = "AIsploitable"
    app_version: str = "0.1.0"
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    default_model: str = os.getenv("DEFAULT_MODEL", "gemma4:e2b")
    fallback_model: str = os.getenv("FALLBACK_MODEL", "gemma4:e4b")
    context_size: int = int(os.getenv("CONTEXT_SIZE", "8192"))
    max_predict: int = int(os.getenv("MAX_PREDICT", "4096"))
    demo_mode: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    data_dir: Path = DATA_DIR

settings = Settings()

