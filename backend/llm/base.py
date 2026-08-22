from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional
from ..models.state import ModelInfo

class BaseLLMProvider(ABC):
    @abstractmethod
    async def list_models(self) -> List[ModelInfo]:
        pass

    @abstractmethod
    async def generate(self, prompt: str, model: str = "gemma4:e2b", system: Optional[str] = None, format_json: bool = False) -> str:
        pass

    @abstractmethod
    async def stream_generate(self, prompt: str, model: str = "gemma4:e2b", system: Optional[str] = None) -> AsyncGenerator[str, None]:
        pass
