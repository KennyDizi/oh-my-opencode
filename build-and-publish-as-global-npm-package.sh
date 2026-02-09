#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKIP_TESTS=false
SKIP_TYPECHECK=false

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$SCRIPT_DIR/build-log-${TIMESTAMP}.txt"

exec > >(tee -a "$LOG_FILE")
exec 2>&1

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
echo "Log file: $LOG_FILE"
echo ""

echo -e "${YELLOW}[1/6]${NC} Installing dependencies..."
bun install
echo -e "${GREEN}Done${NC}\n"

if [[ "$SKIP_TYPECHECK" = false ]]; then
    echo -e "${YELLOW}[2/6]${NC} Running type check..."
    bun run typecheck
    echo -e "${GREEN}Done${NC}\n"
else
    echo -e "${YELLOW}[2/6]${NC} Skipping type check\n"
fi

if [[ "$SKIP_TESTS" = false ]]; then
    echo -e "${YELLOW}[3/6]${NC} Running tests..."
    bun test
    echo -e "${GREEN}Done${NC}\n"
else
    echo -e "${YELLOW}[3/6]${NC} Skipping tests\n"
fi

echo -e "${YELLOW}[4/6]${NC} Building..."
bun run build
echo -e "${GREEN}Done${NC}\n"

echo -e "${YELLOW}[5/6]${NC} Installing globally..."
bun install -g .
echo -e "${GREEN}Done${NC}\n"

if command -v oh-my-opencode &> /dev/null; then
    echo -e "Installed at: ${GREEN}$(command -v oh-my-opencode)${NC}"
    echo -e "Version: $(oh-my-opencode --version 2>/dev/null || echo 'N/A')"
    echo ""
    
    echo -e "${YELLOW}[6/6]${NC} Running oh-my-opencode install..."
    echo -e "${YELLOW}This will configure oh-my-opencode with interactive setup${NC}\n"
    oh-my-opencode install
    echo -e "${GREEN}Done${NC}\n"
else
    echo -e "${YELLOW}Note: 'oh-my-opencode' command may require a new terminal session${NC}"
    echo -e "${YELLOW}After starting a new terminal, run: oh-my-opencode install${NC}\n"
fi

echo -e "${GREEN}--- Installation Complete ---${NC}"
echo ""
