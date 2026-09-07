#!/usr/bin/env bash
set -eux

sudo apt-get update

if ! command -v npm >/dev/null 2>&1; then
  sudo apt-get install -y nodejs npm
fi

sudo npm install -g playwright
sudo env "PATH=$PATH" npx playwright install-deps chromium
npx playwright install chromium

pwsh -NoLogo -NoProfile -Command '$PSVersionTable'
gh --version || true
node --version
npm --version
