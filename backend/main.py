from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .rag.loader import loader
from .api.models import router as models_router
from .api.investigations import router as investigations_router
from .api.reports import router as reports_router
from .api.websocket import router as ws_router
from .api.sandbox import router as sandbox_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm RAG Threat Intel index on startup
    print(f"[*] Starting {settings.app_name} v{settings.app_version}...")
    loader.load_all()
    print("[*] Threat intelligence indexed.")
    yield
    print("[*] Shutting down backend.")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(models_router)
app.include_router(investigations_router)
app.include_router(reports_router)
app.include_router(ws_router)
app.include_router(sandbox_router)

@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "default_model": settings.default_model
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
