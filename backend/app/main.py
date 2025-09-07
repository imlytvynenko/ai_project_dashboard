"""
FastAPI application for RewardOps Analytics POC.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import uuid
from typing import Dict, Any
import asyncio

from .services.react_agent import ReActAgent

app = FastAPI(title="RewardOps Analytics API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ReAct Agent
react_agent = ReActAgent()

# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}


class QueryRequest(BaseModel):
    query: str
    session_id: str


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "RewardOps Analytics API"}


@app.post("/api/query")
async def query_analytics(request: QueryRequest):
    """Process analytics query via HTTP."""
    try:
        result = react_agent.process_query(request.query, request.session_id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time analytics queries."""
    await websocket.accept()
    active_connections[session_id] = websocket
    
    try:
        while True:
            # Receive query from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "query":
                query = message.get("query", "")
                
                # Send processing status
                await websocket.send_text(json.dumps({
                    "type": "status",
                    "message": "Processing your query..."
                }))
                
                try:
                    # Process query with ReAct agent
                    result = react_agent.process_query(query, session_id)
                    
                    # Send result to client
                    await websocket.send_text(json.dumps({
                        "type": "result",
                        "data": result
                    }))
                    
                except Exception as e:
                    # Send error to client
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": str(e)
                    }))
            
    except WebSocketDisconnect:
        # Remove connection when client disconnects
        if session_id in active_connections:
            del active_connections[session_id]
    except Exception as e:
        print(f"WebSocket error: {e}")
        if session_id in active_connections:
            del active_connections[session_id]


@app.get("/api/sessions/{session_id}/status")
async def get_session_status(session_id: str):
    """Get status of a WebSocket session."""
    is_connected = session_id in active_connections
    return {
        "session_id": session_id,
        "connected": is_connected,
        "connection_count": len(active_connections)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
