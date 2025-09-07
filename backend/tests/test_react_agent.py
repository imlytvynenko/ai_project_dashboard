"""
Test suite for ReAct Agent functionality.
"""
import pytest
from app.services.react_agent import ReActAgent


class TestReActAgent:
    """Test cases for ReAct Agent functionality."""
    
    def setup_method(self):
        """Setup test environment."""
        self.agent = ReActAgent()
    
    def test_agent_initialization(self):
        """Test ReAct agent initializes properly."""
        assert self.agent is not None
        assert self.agent.db_client is not None
        assert self.agent.ui_client is not None
        assert self.agent.session_context == {}
    
    def test_natural_language_analysis(self):
        """Test natural language query analysis."""
        result = self.agent._analyze_natural_language_query("Show me total revenue")
        
        assert "entities" in result
        assert "aggregations" in result
        assert "actions" in result
        assert "filters" in result
    
    def test_process_query_complete(self):
        """Test complete query processing with real data."""
        result = self.agent.process_query("Show me total revenue", "test-session")
        
        assert "sql_query" in result
        assert "data" in result
        assert "response" in result
        assert "analysis" in result
        
        # Should contain data from real database
        assert result["data"] is not None
