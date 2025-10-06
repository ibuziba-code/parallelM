#!/usr/bin/env bash
set -euo pipefail

# Render PlantUML diagrams using the plantuml Docker image
# Usage: ./scripts/render-diagrams.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="docs/diagrams"
mkdir -p "$OUT_DIR"

echo "Rendering PlantUML diagrams to $OUT_DIR"

docker run --rm -v "$PWD":/workspace -w /workspace plantuml/plantuml -tpng docs/architecture-component.puml -o "$OUT_DIR"
docker run --rm -v "$PWD":/workspace -w /workspace plantuml/plantuml -tsvg docs/architecture-sequence.puml -o "$OUT_DIR"

echo "Rendered files:"
ls -la "$OUT_DIR"

echo "Done. Commit the generated files if they look correct."
