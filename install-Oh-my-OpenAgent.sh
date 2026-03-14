#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}------ Oh-my-OpenAgent Update Script ------${NC}\n"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Working directory: $SCRIPT_DIR"
echo ""

echo -e "${YELLOW}[1/4]${NC} Installing dependencies with Bun..."
bun install
echo -e "${GREEN}✓${NC} Dependencies installed\n"

echo -e "${YELLOW}[2/4]${NC} Running type check..."
bun run typecheck
echo -e "${GREEN}✓${NC} Type check passed\n"

echo -e "${YELLOW}[3/4]${NC} Building project with Bun..."
bun run build
echo -e "${GREEN}✓${NC} Build completed\n"

echo -e "${YELLOW}[4/4]${NC} Verifying build output..."

FAILED=0

if [ -f "dist/index.js" ]; then
    echo -e "${GREEN}✓${NC} dist/index.js exists"
else
    echo -e "${RED}✗${NC} dist/index.js missing"
    FAILED=1
fi

if [ -f "dist/index.d.ts" ]; then
    echo -e "${GREEN}✓${NC} dist/index.d.ts exists"
else
    echo -e "${RED}✗${NC} dist/index.d.ts missing"
    FAILED=1
fi

if [ -f "dist/cli/index.js" ]; then
    echo -e "${GREEN}✓${NC} dist/cli/index.js exists"
else
    echo -e "${RED}✗${NC} dist/cli/index.js missing"
    FAILED=1
fi

if [ -f "assets/oh-my-openagent.schema.json" ]; then
    echo -e "${GREEN}✓${NC} assets/oh-my-openagent.schema.json exists"
    if command -v jq &> /dev/null; then
        if jq empty assets/oh-my-openagent.schema.json 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Schema is valid JSON"
        else
            echo -e "${RED}✗${NC} Schema is not valid JSON"
            FAILED=1
        fi
    fi
else
    echo -e "${RED}✗${NC} assets/oh-my-openagent.schema.json missing"
    FAILED=1
fi

if [ $FAILED -eq 1 ]; then
    echo -e "${RED}✗${NC} Build verification failed - missing required files"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build verification successful"

echo ""
echo -e "${GREEN}------ Updating Process Complete ------${NC}"
echo -e "${GREEN}Oh-my-OpenAgent${NC} is now up to date with latest source code."
echo "Note: If you're using the local build in opencode.json,"
echo -e "      restart ${GREEN}OpenCode${NC} to load the changes."