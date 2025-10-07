#!/bin/bash

# Digital Ascension Group - Parallel Markets SDK Demo
# Simple startup script

echo "🚀 Starting DAG Demo Server..."
echo ""
echo "The demo will be available at:"
echo "👉 http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8080
