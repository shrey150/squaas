#!/bin/bash
# Quick test script for bot_realtime.py

echo "🧪 Testing bot_realtime.py with single frame"
echo "============================================"
echo ""
echo "Make sure:"
echo "  1. Backend is running (cd backend && make run)"
echo "  2. Frontend is running (cd frontend && npm run dev)"
echo "  3. OPENAI_API_KEY is set"
echo ""

export OPENAI_API_KEY="${OPENAI_API_KEY}"

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set!"
    echo "   Run: export OPENAI_API_KEY='sk-...'"
    exit 1
fi

python3 bot_realtime.py --once

echo ""
echo "✅ Test complete! Check http://localhost:3000 to see the overlay update"

