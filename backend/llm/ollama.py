import json
import httpx
from typing import AsyncGenerator, List, Optional, Dict, Any
from ..config import settings
from ..models.state import ModelInfo
from .base import BaseLLMProvider

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: str = settings.ollama_base_url):
        self.base_url = base_url.rstrip("/")

    async def list_models(self) -> List[ModelInfo]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models_list = []
                    for m in data.get("models", []):
                        name = m.get("name", "")
                        details = m.get("details", {})
                        param_size = details.get("parameter_size", "")
                        family = details.get("family", "")
                        models_list.append(ModelInfo(
                            id=name,
                            name=name,
                            size=param_size,
                            description=f"{family.capitalize()} parameter size: {param_size}",
                            is_default=(name == settings.default_model)
                        ))
                    if models_list:
                        # Ensure default model is first or present
                        return models_list
        except Exception as e:
            print(f"Ollama list_models error: {e}")

        # Default fallback models
        return [
            ModelInfo(id="gemma4:e2b", name="gemma4:e2b", size="5.1B", description="Gemma 4 e2b (Fast Local Cybersecurity Triager)", is_default=True),
            ModelInfo(id="gemma4:e4b", name="gemma4:e4b", size="8.0B", description="Gemma 4 e4b (Deep Reasoning & Exploit Analysis)", is_default=False)
        ]

    async def generate(self, prompt: str, model: str = "gemma4:e2b", system: Optional[str] = None, format_json: bool = False) -> str:
        payload: Dict[str, Any] = {
            "model": model or settings.default_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": settings.max_predict,
                "num_ctx": settings.context_size
            }
        }
        if system:
            payload["system"] = system
        if format_json:
            payload["format"] = "json"

        try:
            timeout_cfg = httpx.Timeout(connect=3.0, read=120.0, write=10.0, pool=5.0)
            async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "")
                else:
                    print(f"Ollama returned {res.status_code}: {res.text}")
        except Exception as e:
            print(f"Ollama generate exception: {e}")

        # Return mock / fallback response if offline
        return ""

    async def stream_generate(self, prompt: str, model: str = "gemma4:e2b", system: Optional[str] = None) -> AsyncGenerator[str, None]:
        payload: Dict[str, Any] = {
            "model": model or settings.default_model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": 0.2,
                "num_predict": settings.max_predict,
                "num_ctx": settings.context_size
            }
        }
        if system:
            payload["system"] = system

        try:
            timeout_cfg = httpx.Timeout(connect=3.0, read=180.0, write=10.0, pool=5.0)
            async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                async with client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
                    async for line in response.aiter_lines():
                            try:
                                chunk = json.loads(line)
                                text = chunk.get("response", "")
                                if text:
                                    yield text
                            except Exception:
                                pass
        except Exception as e:
            print(f"Ollama stream_generate exception: {e}")

ollama_client = OllamaProvider()

