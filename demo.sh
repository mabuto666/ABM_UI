#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/web"
PORT="${1:-8000}"
echo "Serving ABM_UI on http://localhost:${PORT}"
python3 -m http.server "${PORT}"
