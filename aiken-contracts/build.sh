#!/usr/bin/env bash
set -e
if ! command -v aiken &>/dev/null; then
  echo "Installing Aiken..."
  curl --proto '=https' --tlsv1.2 -LsSf https://install.aiken-lang.org | sh
fi
echo "Building Aiken contracts..."
aiken build
echo "Running checks..."
aiken check
echo "Generating blueprint..."
aiken blueprint apply -o plutus.json
echo "Done."
