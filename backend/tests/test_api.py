"""
Test suite for FastAPI application endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestAPIEndpoints:
    """Test cases for API endpoints."""
    
    def test_health_endpoint(self):
        """Test health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "RewardOps Analytics API"
    
    def test_query_endpoint_revenue(self):
        """Test analytics query endpoint with revenue query."""
        payload = {
            "query": "Show me total revenue",
            "session_id": "test-session"
        }
        
        response = client.post("/api/query", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        
        result = data["data"]
        assert "sql_query" in result
        assert "data" in result
        assert "response" in result
        assert "analysis" in result
    
    def test_session_status_endpoint(self):
        """Test session status endpoint."""
        session_id = "test-session-status"
        
        response = client.get(f"/api/sessions/{session_id}/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert "connected" in data
        assert "connection_count" in data
