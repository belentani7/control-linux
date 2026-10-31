#!/usr/bin/env bash
# Bootstrap del entorno control-linux (Linux/WSL/Cloud Shell).
# Verifica prerequisitos, instala dependencias npm y el navegador de Playwright.
set -euo pipefail

echo "=== control-linux bootstrap ==="

missing=0
for cmd in gh git node npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "FALTA: $cmd no esta instalado ni en PATH."
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  echo "Instala los prerequisitos (GitHub CLI, git, Node 20+) y vuelve a ejecutar."
  exit 1
fi

if ! command -v pwsh >/dev/null 2>&1; then
  echo "AVISO: pwsh (PowerShell 7) no esta disponible; los scripts .ps1 no funcionaran hasta instalarlo."
fi

echo "gh $(gh --version | head -1)"
echo "node $(node --version)"
echo "npm $(npm --version)"

echo "Instalando dependencias npm..."
npm install --no-audit --no-fund

echo "Instalando Chromium headless de Playwright..."
npx playwright install chromium

echo "Bootstrap completado."
