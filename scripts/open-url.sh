#!/bin/bash
#
# Opens a URL in the default Windows browser from within WSL.
#
# This script checks if a URL is provided and then uses the `wslview`
# command to ask the Windows host to open it.

# Check if an argument was provided
if [ -z "$1" ]; then
  echo "Usage: $0 <url>"
  exit 1
fi

# Use wslview, wsl-open, or explorer.exe to open the URL
if command -v wslview &> /dev/null; then
  wslview "$1"
elif command -v wsl-open &> /dev/null; then
  wsl-open "$1"
elif command -v explorer.exe &> /dev/null; then
  explorer.exe "$1"
else
  echo "Error: Could not find a command to open the URL."
  echo "None of 'wslview', 'wsl-open', or 'explorer.exe' were found."
  exit 1
fi
