#!/bin/bash

# RewardOps Analytics POC - Frontend Startup Script
# This script starts the React frontend development server

echo "🎨 Starting RewardOps Analytics Frontend..."
echo "=========================================="

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules not found!"
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "Please ensure you're in the correct frontend directory"
    exit 1
fi

# Kill any existing React development servers
echo "🔄 Stopping any existing frontend processes..."
pkill -f "react-scripts start" 2>/dev/null || true
pkill -f "node.*start" 2>/dev/null || true
sleep 2

# Check if backend is running
echo "🔍 Checking backend server..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend server is running at http://localhost:8000"
else
    echo "⚠️  Backend server not detected at http://localhost:8000"
    echo "   Make sure to run ./start-backend.sh first"
fi

# Start the React development server
echo "🌟 Starting React development server..."
echo "🌐 Frontend will be available at http://localhost:3000"
echo "🔄 Press Ctrl+C to stop the server"
echo ""

# Set environment variables for better development experience
export BROWSER=none  # Prevent auto-opening browser
export GENERATE_SOURCEMAP=false  # Faster builds

npm start
