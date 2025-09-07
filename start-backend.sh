#!/bin/bash

# RewardOps Analytics POC - Backend Startup Script
# This script starts the FastAPI backend server

echo "🚀 Starting RewardOps Analytics Backend..."
echo "=========================================="

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run the following commands first:"
    echo "  cd backend"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install fastapi uvicorn psycopg2-binary websockets pydantic"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if required packages are installed
echo "📦 Checking dependencies..."
python -c "import fastapi, uvicorn, psycopg2, websockets, pydantic" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Required packages not found!"
    echo "Installing dependencies..."
    pip install fastapi uvicorn psycopg2-binary websockets pydantic
fi

# Check if PostgreSQL is accessible
echo "🗃️  Checking database connection..."
python -c "
import sys
sys.path.insert(0, '.')
try:
    from app.services.mcp_clients import MCPDatabaseClient
    client = MCPDatabaseClient()
    client.execute_sql('SELECT 1')
    print('✅ Database connection successful!')
except Exception as e:
    print('❌ Database connection failed:', e)
    print('Please ensure PostgreSQL is running with pangea_development database')
" 2>/dev/null

# Kill any existing uvicorn processes
echo "🔄 Stopping any existing backend processes..."
pkill -f uvicorn 2>/dev/null || true
sleep 2

# Start the FastAPI server
echo "🌟 Starting FastAPI server on http://localhost:8000..."
echo "📡 API documentation available at http://localhost:8000/docs"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
