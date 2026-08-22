import uuid
import asyncio
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..models.state import Investigation, CreateInvestigationRequest
from ..agents.orchestrator import orchestrator
from ..api.websocket import ws_manager
from ..llm.ollama import ollama_client
from ..config import settings

router = APIRouter(prefix="/api", tags=["Investigations & Inference"])

class DirectPromptRequest(BaseModel):
    prompt: str
    model: Optional[str] = "gemma4:e2b"
    system_prompt: Optional[str] = "You are a helpful cybersecurity triage AI."

@router.post("/investigations", response_model=Investigation)
async def create_investigation(req: CreateInvestigationRequest, background_tasks: BackgroundTasks):
    inv_id = str(uuid.uuid4())[:8]
    model_name = req.model or settings.default_model

    investigation = Investigation(
        id=inv_id,
        source_url=req.source_url,
        raw_input_text=req.input_text,
        model_used=model_name
    )

    orchestrator.investigations[inv_id] = investigation

    # Run investigation asynchronously and stream over websocket
    async def run_task():
        # Short sleep to allow frontend client to connect websocket
        await asyncio.sleep(0.5)
        await orchestrator.run(
            investigation=investigation,
            event_callback=lambda event_type, data: ws_manager.broadcast(inv_id, event_type, data)
        )

    background_tasks.add_task(run_task)
    return investigation

@router.get("/investigations/{id}", response_model=Investigation)
async def get_investigation(id: str):
    inv = orchestrator.get(id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv

@router.post("/prompt")
async def direct_prompt(req: DirectPromptRequest):
    """
    Directly routes user prompt / advisory to the local Ollama server.
    """
    model_name = req.model or settings.default_model
    response_text = await ollama_client.generate(
        prompt=req.prompt,
        model=model_name,
        system=req.system_prompt
    )
    return {
        "model": model_name,
        "response": response_text
    }

@router.post("/prompt/stream")
async def direct_prompt_stream(req: DirectPromptRequest):
    """
    Directly streams response from local Ollama model to the client.
    """
    model_name = req.model or settings.default_model
    
    async def stream_generator():
        async for chunk in ollama_client.stream_generate(
            prompt=req.prompt,
            model=model_name,
            system=req.system_prompt
        ):
            yield chunk

    return StreamingResponse(stream_generator(), media_type="text/plain")
