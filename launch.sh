#!/bin/bash

# Bryce's Book Lab - Quick Launch Script

echo "🚀 Launching Bryce's Book Lab..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time only)..."
    npm install
    echo ""
fi

# Launch the app
echo "✨ Starting the application..."
npm run electron:dev
