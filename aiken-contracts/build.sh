#!/usr/bin/env bash
set -euo pipefail

# Install Aiken toolchain manager (aikup) if missing
if ! command -v aikup >/dev/null 2>&1; then
  echo "Installing Aiken toolchain manager (aikup)…"
  curl --proto '=https' --tlsv1.2 -LsSf https://install.aiken-lang.org | sh
fi

# Ensure PATH shims are active in this shell
if [ -f "$HOME/.aiken/bin/env" ]; then
  # shellcheck disable=SC1090
  source "$HOME/.aiken/bin/env"
fi

# Install the actual Aiken compiler (if not already installed)
if ! command -v aiken >/dev/null 2>&1; then
  echo "Installing Aiken compiler with aikup…"
  aikup install
  hash -r
fi

echo "Building Aiken contracts…"
aiken build

echo "Running tests…"
aiken check

echo "Generating Plutus blueprint…"
aiken blueprint apply -o plutus.json

echo "✅ Build complete! Blueprint saved to plutus.json"
