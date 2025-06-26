#!/bin/bash
# Start development server in background without blocking Claude interface

# Kill any existing processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start the Vercel dev server in background for full API support, redirect output to log file
nohup npm run dev:vercel > dev-server.log 2>&1 &

# Get the PID
DEV_PID=$!
echo "Vercel development server started with PID: $DEV_PID"
echo "Server will be available at: http://localhost:3000"
echo "Weather forecast API routes are enabled"
echo "Logs are in: dev-server.log"
echo "To stop: kill $DEV_PID"

# Wait a moment and check if it's actually running
sleep 3
if kill -0 $DEV_PID 2>/dev/null; then
    echo "✅ Dev server is running successfully"
else
    echo "❌ Dev server failed to start, check dev-server.log"
fi