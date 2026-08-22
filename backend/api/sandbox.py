from fastapi import APIRouter
from pydantic import BaseModel
import shutil
import subprocess
from ..sandbox.manager import sandbox_manager

router = APIRouter(prefix="/api/sandbox", tags=["Sandbox Management"])

class DockerStatusResponse(BaseModel):
    docker_available: bool
    docker_version: str
    active_containers_count: int

@router.get("/status", response_model=DockerStatusResponse)
def get_docker_status():
    available = sandbox_manager._check_docker()
    version = "Unknown"
    active_count = 0
    if available:
        try:
            ver_res = subprocess.run(["docker", "--version"], capture_output=True, text=True, timeout=2)
            version = ver_res.stdout.strip()
            ps_res = subprocess.run(["docker", "ps", "-q"], capture_output=True, text=True, timeout=2)
            active_count = len([line for line in ps_res.stdout.splitlines() if line.strip()])
        except Exception:
            pass
    return DockerStatusResponse(
        docker_available=available,
        docker_version=version,
        active_containers_count=active_count
    )
