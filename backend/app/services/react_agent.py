"""
ReAct Agent for natural language query processing.
"""
import json
import re
from typing import Dict, List, Optional, Any
from datetime import datetime

from .mcp_clients import MCPDatabaseClient, MCPUIGeneratorClient


class ReActAgent:
    """
    ReAct (Reason + Act) agent for processing natural language analytics queries.
    Handles any natural language query by dynamically generating appropriate SQL.
    """

    def __init__(self):
        self.db_client = MCPDatabaseClient()
        self.ui_client = MCPUIGeneratorClient()
        self.session_context = {}

        # Database schema knowledge - this should ideally be loaded dynamically
        self.known_tables = {
            'orders': ['id', 'external_id', 'created_at', 'updated_at', 'payment_status',
                      'fulfillment_status', 'program_id', 'order_recipient_id'],
            'programs': ['id', 'name', 'description'],
            'members': ['id', 'email', 'first_name', 'last_name'],
            # Add more tables as discovered
        }

    def process_query(self, query: str, session_id: str) -> Dict[str, Any]:
        """Process any natural language query using ReAct methodology."""
        try:
            # Step 1: Thought - Analyze what the user wants
            analysis = self._analyze_natural_language_query(query)

            # Step 2: Action - Generate appropriate SQL
            sql_query = self._generate_dynamic_sql(analysis)

            # Step 3: Observation - Execute query and get results
            query_results = self._execute_query(sql_query)

            # Step 4: Response - Format response naturally
            response = self._format_natural_response(analysis, query_results, sql_query)

            return response

        except Exception as e:
            return {
                "error": str(e),
                "sql_query": None,
                "data": None,
                "charts": None,
                "response": f"I encountered an error processing your query: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

    def _analyze_natural_language_query(self, query: str) -> Dict[str, Any]:
        """Analyze any natural language query to understand intent and extract key information."""
        query_lower = query.lower().strip()

        analysis = {
            "original_query": query,
            "query_type": "unknown",
            "entities": [],
            "actions": [],
            "filters": {},
            "aggregations": [],
            "time_references": [],
            "table_hints": []
        }

        # Detect query types
        if any(word in query_lower for word in ["show", "display", "get", "find", "list"]):
            analysis["query_type"] = "retrieve"
        elif any(word in query_lower for word in ["count", "how many", "number of"]):
            analysis["query_type"] = "count"
        elif any(word in query_lower for word in ["total", "sum", "revenue", "amount"]):
            analysis["query_type"] = "aggregate"
        elif any(word in query_lower for word in ["average", "avg", "mean"]):
            analysis["query_type"] = "average"
        elif any(word in query_lower for word in ["max", "maximum", "highest", "largest"]):
            analysis["query_type"] = "maximum"
        elif any(word in query_lower for word in ["min", "minimum", "lowest", "smallest"]):
            analysis["query_type"] = "minimum"

        # Detect entities (tables/objects)
        if any(word in query_lower for word in ["order", "orders", "purchase", "transaction"]):
            analysis["entities"].append("orders")
        if any(word in query_lower for word in ["customer", "member", "user", "client"]):
            analysis["entities"].append("members")
        if any(word in query_lower for word in ["program", "programs", "campaign"]):
            analysis["entities"].append("programs")

        # Detect time references
        if any(word in query_lower for word in ["today", "yesterday", "last week", "this month"]):
            analysis["time_references"].append("recent")
        if any(word in query_lower for word in ["last", "latest", "recent", "newest"]):
            analysis["time_references"].append("latest")
        if any(word in query_lower for word in ["first", "oldest", "earliest"]):
            analysis["time_references"].append("earliest")

        # Detect status filters
        if "paid" in query_lower:
            analysis["filters"]["payment_status"] = "PAID"
        if "pending" in query_lower:
            if "payment" in query_lower:
                analysis["filters"]["payment_status"] = "PENDING"
            elif "fulfillment" in query_lower:
                analysis["filters"]["fulfillment_status"] = "PENDING"
        if "fulfilled" in query_lower:
            analysis["filters"]["fulfillment_status"] = "FULFILLED"

        # Detect limits
        numbers = re.findall(r'\b(\d+)\b', query_lower)
        if numbers:
            analysis["limit"] = int(numbers[0])
        elif any(word in query_lower for word in ["all", "everything"]):
            analysis["limit"] = None
        else:
            analysis["limit"] = 10  # Default reasonable limit

        return analysis

    def _generate_dynamic_sql(self, analysis: Dict[str, Any]) -> str:
        """Generate SQL based on natural language analysis."""
        entities = analysis["entities"]
        query_type = analysis["query_type"]
        filters = analysis["filters"]
        time_refs = analysis["time_references"]
        limit = analysis.get("limit", 10)

        # Default to orders table if no specific entity detected
        if not entities:
            entities = ["orders"]

        primary_entity = entities[0]

        # Build SELECT clause based on query type
        if query_type == "count":
            select_clause = "SELECT COUNT(*) as total_count"
        elif query_type == "aggregate":
            if primary_entity == "orders":
                select_clause = """SELECT
                    COUNT(*) as total_orders,
                    COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid_orders,
                    COUNT(CASE WHEN fulfillment_status = 'FULFILLED' THEN 1 END) as fulfilled_orders"""
            else:
                select_clause = "SELECT COUNT(*) as total_count"
        else:
            # Default retrieve - show relevant columns
            if primary_entity == "orders":
                select_clause = """SELECT
                    id,
                    external_id,
                    created_at,
                    payment_status,
                    fulfillment_status,
                    program_id"""
            elif primary_entity == "programs":
                select_clause = "SELECT id, name, description"
            elif primary_entity == "members":
                select_clause = "SELECT id, email, first_name, last_name"
            else:
                select_clause = "SELECT *"

        # Build FROM clause
        from_clause = f"FROM {primary_entity}"

        # Build WHERE clause
        where_conditions = []
        for field, value in filters.items():
            where_conditions.append(f"{field} = '{value}'")

        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)

        # Build ORDER BY clause
        order_clause = ""
        if "latest" in time_refs and primary_entity in ["orders"]:
            order_clause = "ORDER BY created_at DESC"
        elif "earliest" in time_refs and primary_entity in ["orders"]:
            order_clause = "ORDER BY created_at ASC"
        elif query_type == "retrieve" and primary_entity == "orders":
            order_clause = "ORDER BY created_at DESC"

        # Build LIMIT clause
        limit_clause = ""
        if limit and query_type != "count" and query_type != "aggregate":
            limit_clause = f"LIMIT {limit}"

        # Combine all parts
        sql_parts = [select_clause, from_clause, where_clause, order_clause, limit_clause]
        sql_query = " ".join([part for part in sql_parts if part])

        return sql_query

    def _execute_query(self, sql_query: str) -> Optional[List[Dict[str, Any]]]:
        """Execute SQL query using MCP database client."""
        try:
            result = self.db_client.execute_sql(sql_query)
            return result
        except Exception as e:
            raise Exception(f"Database query failed: {str(e)}")

    def _format_natural_response(self, analysis: Dict[str, Any],
                                query_results: Optional[List[Dict[str, Any]]],
                                sql_query: str) -> Dict[str, Any]:
        """Format the response naturally based on what the user asked."""
        if not query_results:
            return {
                "error": "No data found",
                "sql_query": sql_query,
                "data": None,
                "charts": None,
                "response": "I couldn't find any data matching your query.",
                "timestamp": datetime.now().isoformat()
            }

        response_text = self._generate_contextual_response(analysis, query_results)

        # Generate chart if data is suitable
        chart_config = None
        if len(query_results) > 1 or analysis["query_type"] == "aggregate":
            chart_config = self.ui_client.generate_chart_config(query_results, analysis["original_query"])

        return {  # ✅ FIXED: 8 spaces for proper indentation
            "sql_query": sql_query,
            "data": query_results,
            "charts": chart_config,
            "response": response_text,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }

    def _generate_contextual_response(self, analysis: Dict[str, Any],
                                    data: List[Dict[str, Any]]) -> str:
        """Generate a natural language response based on what the user asked and what we found."""
        query_type = analysis["query_type"]
        entities = analysis["entities"]
        original_query = analysis["original_query"]

        if not data:
            return "No data found for your query."

        # Handle count queries
        if query_type == "count":
            count = data[0].get("total_count", len(data))
            entity_name = entities[0] if entities else "records"
            return f"**Found {count:,} {entity_name}** matching your criteria.\n\n*Data retrieved from pangea_development database.*"

        # Handle aggregate queries
        elif query_type == "aggregate":
            result = data[0]
            response = f"**Analytics Summary for your query:**\n\n"

            for key, value in result.items():
                if key and value is not None:
                    formatted_key = key.replace('_', ' ').title()
                    if isinstance(value, (int, float)):
                        response += f"• **{formatted_key}:** {value:,}\n"
                    else:
                        response += f"• **{formatted_key}:** {value}\n"

            response += "\n*Real-time data from pangea_development database.*"
            return response

        # Handle single record queries
        elif len(data) == 1:
            record = data[0]
            entity_name = entities[0] if entities else "record"
            response = f"**{entity_name.title()} Details:**\n\n"

            for key, value in record.items():
                if key and value is not None:
                    formatted_key = key.replace('_', ' ').title()
                    response += f"• **{formatted_key}:** {value}\n"

            response += f"\n*Retrieved from pangea_development database.*"
            return response

        # Handle multiple records
        else:
            entity_name = entities[0] if entities else "records"
            response = f"**Found {len(data)} {entity_name}:**\n\n"

            for i, record in enumerate(data[:5], 1):  # Show first 5
                response += f"**{i}.** "
                # Show key fields for each record
                key_fields = ['id', 'name', 'email', 'external_id', 'created_at']
                shown_fields = []

                for field in key_fields:
                    if field in record and record[field] is not None:
                        shown_fields.append(f"{field}: {record[field]}")

                if shown_fields:
                    response += " | ".join(shown_fields[:3])  # Max 3 fields per line
                response += "\n"

            if len(data) > 5:
                response += f"\n... and {len(data) - 5} more records.\n"

            response += f"\n*Real data from pangea_development database.*"
            return response