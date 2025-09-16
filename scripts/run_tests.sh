#!/bin/bash

# Up Hera Test Runner Script
# Comprehensive testing with different test categories

set -e

echo "🧪 Up Hera Test Suite"
echo "===================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test categories
UNIT_TESTS="api/tests/test_api.py"
WEBSOCKET_TESTS="api/tests/test_websocket.py"
STREAMING_TESTS="api/tests/test_streaming.py"  
INTEGRATION_TESTS="api/tests/test_integration.py"
LOAD_TESTS="api/tests/test_load.py"

# Default test category
TEST_CATEGORY=${1:-"all"}

# Navigate to API directory
cd api

echo -e "${BLUE}📁 Current directory: $(pwd)${NC}"
echo -e "${BLUE}🐍 Python version: $(python --version)${NC}"

# Install test dependencies if needed
echo -e "${YELLOW}📦 Installing test dependencies...${NC}"
pip install pytest pytest-asyncio psutil > /dev/null 2>&1

# Function to run specific test category
run_test_category() {
    local test_file=$1
    local category_name=$2
    
    echo -e "\n${BLUE}🧪 Running ${category_name} Tests${NC}"
    echo "----------------------------------------"
    
    if [ -f "$test_file" ]; then
        if python -m pytest "$test_file" -v --tb=short; then
            echo -e "${GREEN}✅ ${category_name} tests passed!${NC}"
            return 0
        else
            echo -e "${RED}❌ ${category_name} tests failed!${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  ${test_file} not found, skipping ${category_name} tests${NC}"
        return 0
    fi
}

# Function to run load tests with special handling
run_load_tests() {
    echo -e "\n${BLUE}🚀 Running Load & Performance Tests${NC}"
    echo "----------------------------------------"
    echo -e "${YELLOW}⚠️  Warning: Load tests may take several minutes${NC}"
    
    if [ -f "$LOAD_TESTS" ]; then
        if python -m pytest "$LOAD_TESTS" -v --tb=short -s; then
            echo -e "${GREEN}✅ Load tests completed!${NC}"
            return 0
        else
            echo -e "${RED}❌ Load tests failed!${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Load tests not found${NC}"
        return 0
    fi
}

# Test execution based on category
case $TEST_CATEGORY in
    "unit")
        echo -e "${YELLOW}Running Unit Tests Only${NC}"
        run_test_category "$UNIT_TESTS" "Unit"
        ;;
    "websocket")
        echo -e "${YELLOW}Running WebSocket Tests Only${NC}"
        run_test_category "$WEBSOCKET_TESTS" "WebSocket"
        ;;
    "streaming")
        echo -e "${YELLOW}Running Streaming Tests Only${NC}"
        run_test_category "$STREAMING_TESTS" "Streaming"
        ;;
    "integration")
        echo -e "${YELLOW}Running Integration Tests Only${NC}"
        run_test_category "$INTEGRATION_TESTS" "Integration"
        ;;
    "load")
        echo -e "${YELLOW}Running Load Tests Only${NC}"
        run_load_tests
        ;;
    "fast")
        echo -e "${YELLOW}Running Fast Tests (Unit + WebSocket + Streaming)${NC}"
        failed=0
        run_test_category "$UNIT_TESTS" "Unit" || failed=1
        run_test_category "$WEBSOCKET_TESTS" "WebSocket" || failed=1
        run_test_category "$STREAMING_TESTS" "Streaming" || failed=1
        
        if [ $failed -eq 0 ]; then
            echo -e "\n${GREEN}🎉 All fast tests passed!${NC}"
        else
            echo -e "\n${RED}💥 Some fast tests failed!${NC}"
            exit 1
        fi
        ;;
    "all")
        echo -e "${YELLOW}Running All Tests${NC}"
        failed=0
        
        # Run tests in order of increasing complexity/time
        run_test_category "$UNIT_TESTS" "Unit" || failed=1
        run_test_category "$WEBSOCKET_TESTS" "WebSocket" || failed=1
        run_test_category "$STREAMING_TESTS" "Streaming" || failed=1
        run_test_category "$INTEGRATION_TESTS" "Integration" || failed=1
        
        # Ask user if they want to run load tests
        echo -e "\n${YELLOW}🤔 Do you want to run load tests? (they may take 5-10 minutes) [y/N]${NC}"
        read -r run_load
        
        if [[ $run_load =~ ^[Yy]$ ]]; then
            run_load_tests || failed=1
        else
            echo -e "${BLUE}⏭️  Skipping load tests${NC}"
        fi
        
        # Final result
        if [ $failed -eq 0 ]; then
            echo -e "\n${GREEN}🎉 All tests completed successfully!${NC}"
            echo -e "${GREEN}✨ Your Up Hera application is ready for production!${NC}"
        else
            echo -e "\n${RED}💥 Some tests failed!${NC}"
            echo -e "${RED}🔧 Please fix the failing tests before deploying.${NC}"
            exit 1
        fi
        ;;
    "coverage")
        echo -e "${YELLOW}Running Tests with Coverage${NC}"
        
        # Install coverage if not present
        pip install pytest-cov > /dev/null 2>&1
        
        echo -e "\n${BLUE}📊 Running tests with coverage analysis...${NC}"
        python -m pytest tests/ --cov=. --cov-report=html --cov-report=term-missing
        
        echo -e "\n${GREEN}📈 Coverage report generated in htmlcov/index.html${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown test category: $TEST_CATEGORY${NC}"
        echo -e "${BLUE}Available categories:${NC}"
        echo "  unit       - Unit tests only"
        echo "  websocket  - WebSocket tests only"
        echo "  streaming  - AI streaming tests only"
        echo "  integration- Integration tests only"
        echo "  load       - Load/performance tests only"
        echo "  fast       - Quick tests (unit + websocket + streaming)"
        echo "  all        - All tests (default)"
        echo "  coverage   - Tests with coverage analysis"
        echo ""
        echo -e "${BLUE}Usage:${NC}"
        echo "  ./scripts/run_tests.sh [category]"
        echo ""
        echo -e "${BLUE}Examples:${NC}"
        echo "  ./scripts/run_tests.sh unit"
        echo "  ./scripts/run_tests.sh fast"
        echo "  ./scripts/run_tests.sh all"
        exit 1
        ;;
esac

echo -e "\n${BLUE}🏁 Test execution completed!${NC}"
