#!/bin/bash
# Cypress test runner script with environment setup

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Unboreify Cypress E2E Testing${NC}"
echo "======================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local not found${NC}"
    echo "Creating .env.local from .env.cypress template..."
    cp .env.cypress .env.local
    echo -e "${YELLOW}📝 Please edit .env.local and add your test credentials${NC}"
    echo "   - CYPRESS_SPOTIFY_TEST_USERNAME"
    echo "   - CYPRESS_SPOTIFY_TEST_PASSWORD"
    echo "   - VITE_SPOTIFY_CLIENT_ID"
    echo ""
fi

# Check if development server is running
echo "🔍 Checking if development server is running..."
if curl -s http://localhost:8888 > /dev/null; then
    echo -e "${GREEN}✅ Development server is running on http://localhost:8888${NC}"
else
    echo -e "${RED}❌ Development server is not running${NC}"
    echo "Please start the development server first:"
    echo "  pnpm dev:netlify"
    echo ""
    echo "Or if you want to run tests against production:"
    echo "  CYPRESS_BASE_URL=https://your-production-url.netlify.app pnpm test:e2e"
    exit 1
fi

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Run tests based on argument
case "$1" in
    "open"|"gui")
        echo "🎯 Opening Cypress Test Runner..."
        npx cypress open
        ;;
    "run"|"headless"|"")
        echo "🏃 Running tests in headless mode..."
        npx cypress run
        ;;
    "headed")
        echo "🏃 Running tests with browser visible..."
        npx cypress run --headed
        ;;
    "redirections")
        echo "🔄 Running redirection tests..."
        npx cypress run --spec "cypress/e2e/redirections.cy.ts"
        ;;
    "oauth")
        echo "🔐 Running OAuth tests..."
        npx cypress run --spec "cypress/e2e/oauth.cy.ts"
        ;;
    "functionality")
        echo "⚙️  Running functionality tests..."
        npx cypress run --spec "cypress/e2e/app-functionality.cy.ts"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  open, gui        Open Cypress Test Runner (interactive)"
        echo "  run, headless    Run tests in headless mode (default)"
        echo "  headed           Run tests with browser visible"
        echo "  redirections     Run only redirection tests"
        echo "  oauth            Run only OAuth tests"
        echo "  functionality    Run only functionality tests"
        echo "  help             Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                    # Run all tests headless"
        echo "  $0 open              # Open interactive test runner"
        echo "  $0 redirections      # Run only redirection tests"
        echo ""
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Test execution completed${NC}"
