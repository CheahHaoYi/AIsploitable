from typing import List
from fastapi import APIRouter
from ..llm.ollama import ollama_client
from ..models.state import ModelInfo

router = APIRouter(prefix="/api/models", tags=["Models"])

@router.get("", response_model=List[ModelInfo])
async def get_available_models():
    """
    Returns the list of available local Ollama models (e.g. gemma4:e2b, gemma4:e4b).
    """
    return await ollama_client.list_models()
