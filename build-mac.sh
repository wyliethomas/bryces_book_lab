#!/bin/bash

echo "🚀 Building Bryce's Book Lab for macOS..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Build the app
echo "🔨 Building the DMG installer..."
echo "This will take a few minutes..."
echo ""

npm run electron:build

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Your DMG installer is here:"
echo "   dist-electron/Bryce's Book Lab-1.0.0.dmg"
echo ""
echo "🎉 Ready to deliver to Bryce!"
