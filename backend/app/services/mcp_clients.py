"""
MCP clients using REAL PostgreSQL database connection.
"""
import psycopg2
import json
from typing import Dict, List, Optional, Any


class MCPDatabaseClient:
    """Client for executing database operations via direct PostgreSQL connection."""

    def __init__(self):
        # Database connection parameters (same as used by MCP tools)
        self.connection_params = {
            'host': 'localhost',
            'port': 5432,
            'database': 'pangea_development',
            'user': 'mcp_user',
            'password': 'mcp_password123'
        }

    def execute_sql(self, sql_query: str) -> List[Dict[str, Any]]:
        """Execute SQL query using direct PostgreSQL connection."""
        try:
            # Connect to PostgreSQL database
            conn = psycopg2.connect(**self.connection_params)
            cursor = conn.cursor()

            # Execute query
            cursor.execute(sql_query)

            # Get column names
            columns = [desc[0] for desc in cursor.description]

            # Fetch results
            rows = cursor.fetchall()

            # Convert to list of dictionaries
            results = []
            for row in rows:
                result_dict = {}
                for i, value in enumerate(row):
                    # Handle datetime objects by converting to string
                    if hasattr(value, 'isoformat'):
                        result_dict[columns[i]] = value.isoformat()
                    else:
                        result_dict[columns[i]] = value
                results.append(result_dict)

            # Close connections
            cursor.close()
            conn.close()

            return results

        except Exception as e:
            raise Exception(f"Database query failed: {str(e)}")


class MCPUIGeneratorClient:
    """Client for generating UI configurations."""

    def __init__(self):
        pass

    def generate_chart_config(self, data: List[Dict[str, Any]], query_intent: str) -> Optional[Dict[str, Any]]:
        """Generate chart configuration based on data and query intent."""
        if not data:
            return None

        sample_record = data[0]

        # For time-series data
        if any(key for key in sample_record.keys() if 'date' in key.lower() or 'time' in key.lower()):
            return {
                "type": "line",
                "chart_type": "line",
                "title": "Trends Over Time",
                "x_axis": next(key for key in sample_record.keys() if 'date' in key.lower() or 'time' in key.lower()),
                "y_axis": next((key for key in sample_record.keys() if any(t in key.lower() for t in ['amount', 'revenue', 'count', 'total'])), None),
                "data": data
            }

        return None

    def format_data_table(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format data for table display."""
        if not data:
            return {"headers": [], "rows": []}

        headers = list(data[0].keys())
        rows = []
        for record in data:
            row = [str(record.get(header, '')) for header in headers]
            rows.append(row)

        return {
            "headers": headers,
            "rows": rows
        }