import json
import asyncio
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Map investigation ID to set of connected WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, inv_id: str, websocket: WebSocket):
        await websocket.accept()
        if inv_id not in self.active_connections:
            self.active_connections[inv_id] = set()
        self.active_connections[inv_id].add(websocket)

    def disconnect(self, inv_id: str, websocket: WebSocket):
        if inv_id in self.active_connections:
            self.active_connections[inv_id].discard(websocket)
            if not self.active_connections[inv_id]:
                del self.active_connections[inv_id]

    async def broadcast(self, inv_id: str, event_type: str, data: dict):
        if inv_id in self.active_connections:
            message = json.dumps({"type": event_type, "data": data, "investigation_id": inv_id})
            dead_sockets = set()
            for connection in self.active_connections[inv_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    dead_sockets.add(connection)
            for dead in dead_sockets:
                self.active_connections[inv_id].discard(dead)

ws_manager = ConnectionManager()

@router.websocket("/ws/{id}")
async def websocket_endpoint(websocket: WebSocket, id: str):
    await ws_manager.connect(id, websocket)
    try:
        while True:
            # Keep-alive receive
            data = await websocket.receive_text()
            # Handle client ping if needed
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "PONG"}))
    except WebSocketDisconnect:
        ws_manager.disconnect(id, websocket)
    except Exception:
        ws_manager.disconnect(id, websocket)
