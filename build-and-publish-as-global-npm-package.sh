#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKIP_TESTS=false
SKIP_TYPECHECK=false

usage() {
    echo -e "${GREEN}--- Oh-my-OpenCode: Build & Install as Global Package ---${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Builds and installs oh-my-opencode globally on your local machine."
    echo "No npm registry publish - installs directly from source."
    echo ""
    echo "Options:"
    echo "  --skip-tests      Skip running tests"
    echo "  --skip-typecheck  Skip TypeScript type checking"
    echo "  -h, --help        Show this help message"
    echo ""
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests) SKIP_TESTS=true; shift ;;
        --skip-typecheck) SKIP_TYPECHECK=true; shift ;;
        -h|--help) usage ;;
        *) echo -e "${RED}Unknown option: $1${NC}"; exit 1 ;;
    esac
done

cd "$SCRIPT_DIR"

echo -e "${GREEN}--- Oh-my-OpenCode: Build & Install as Global Package ---${NC}\n"
echo "Working directory: $SCRIPT_DIR"
echo ""

echo -e "${YELLOW}[1/5]${NC} Installing dependencies..."
bun install
echo -e "${GREEN}Done${NC}\n"

if [[ "$SKIP_TYPECHECK" = false ]]; then
    echo -e "${YELLOW}[2/5]${NC} Running type check..."
    bun run typecheck
    echo -e "${GREEN}Done${NC}\n"
else
    echo -e "${YELLOW}[2/5]${NC} Skipping type check\n"
fi

if [[ "$SKIP_TESTS" = false ]]; then
    echo -e "${YELLOW}[3/5]${NC} Running tests..."
    bun test
    echo -e "${GREEN}Done${NC}\n"
else
    echo -e "${YELLOW}[3/5]${NC} Skipping tests\n"
fi

echo -e "${YELLOW}[4/5]${NC} Building..."
bun run build
echo -e "${GREEN}Done${NC}\n"

echo -e "${YELLOW}[5/5]${NC} Installing globally..."
npm install -g .
echo -e "${GREEN}Done${NC}\n"

echo -e "${GREEN}--- Installation Complete ---${NC}"
echo ""
if command -v oh-my-opencode &> /dev/null; then
    echo -e "Installed at: ${GREEN}$(command -v oh-my-opencode)${NC}"
    echo -e "Version: $(oh-my-opencode --version 2>/dev/null || echo 'N/A')"
else
    echo -e "${YELLOW}Note: 'oh-my-opencode' command may require a new terminal session${NC}"
fi
echo ""
