#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}------ Oh-my-OpenCode Update Script ------${NC}\n"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Working directory: $SCRIPT_DIR"
echo ""

echo -e "${YELLOW}[1/5]${NC} Installing dependencies with Bun..."
bun install
echo -e "${GREEN}✓${NC} Dependencies installed\n"

echo -e "${YELLOW}[2/5]${NC} Migrating @opencode-ai/sdk module structure..."
SDK_DIR="node_modules/@opencode-ai/sdk"
if [ -d "$SDK_DIR/dist/src" ]; then
    cd "$SDK_DIR/dist"
    ln -sf src/index.js index.js 2>/dev/null || true
    ln -sf src/index.d.ts index.d.ts 2>/dev/null || true
    ln -sf src/client.js client.js 2>/dev/null || true
    ln -sf src/client.d.ts client.d.ts 2>/dev/null || true
    ln -sf src/server.js server.js 2>/dev/null || true
    ln -sf src/server.d.ts server.d.ts 2>/dev/null || true
    ln -sf src/v2 v2 2>/dev/null || true
    ln -sf src/gen gen 2>/dev/null || true
    cd "$SCRIPT_DIR"
    echo -e "${GREEN}✓${NC} SDK structure migrated\n"
else
    echo -e "${GREEN}✓${NC} SDK structure OK (already migrated or not needed)\n"
fi

echo -e "${YELLOW}[3/5]${NC} Running type check..."
bun run typecheck
echo -e "${GREEN}✓${NC} Type check passed\n"

echo -e "${YELLOW}[4/5]${NC} Building project with Bun..."
bun run build
echo -e "${GREEN}✓${NC} Build completed\n"

echo -e "${YELLOW}[5/5]${NC} Verifying build output..."

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

if [ -f "assets/oh-my-opencode.schema.json" ]; then
    echo -e "${GREEN}✓${NC} assets/oh-my-opencode.schema.json exists"
    if command -v jq &> /dev/null; then
        if jq empty assets/oh-my-opencode.schema.json 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Schema is valid JSON"
        else
            echo -e "${RED}✗${NC} Schema is not valid JSON"
            FAILED=1
        fi
    fi
else
    echo -e "${RED}✗${NC} assets/oh-my-opencode.schema.json missing"
    FAILED=1
fi

if [ $FAILED -eq 1 ]; then
    echo -e "${RED}✗${NC} Build verification failed - missing required files"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build verification successful"

echo ""
echo -e "${GREEN}------ Updating Process Complete ------${NC}"
echo -e "Oh-my-OpenCode is now up to date with latest source code.${NC}"
echo ""
echo "Note: If you're using the local build in opencode.json,"
echo "      restart OpenCode to load the changes."
