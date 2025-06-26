#!/bin/bash

# Kill any existing React dev server
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 1

# Start fresh server
npm start