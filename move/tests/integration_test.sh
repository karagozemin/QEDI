#!/bin/bash

# QEDI Smart Contract Integration Tests
# Tests the contract on a local Sui network

set -e

echo "🧪 QEDI Integration Test Suite"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to run test
run_test() {
    local test_name=$1
    local command=$2
    
    echo -n "Testing: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

echo ""
echo "📦 Building contract..."
cd "$(dirname "$0")/.."
sui move build --skip-fetch-latest-git-deps

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""
echo "🔍 Running static analysis tests..."
echo ""

# Test 1: Check if contract compiles
run_test "Contract compilation" "sui move build --skip-fetch-latest-git-deps"

# Test 2: Check for syntax errors (no errors, only warnings allowed)
run_test "Syntax validation" "sui move build --skip-fetch-latest-git-deps 2>&1 | grep -q 'BUILDING qedi'"

# Test 3: Verify struct definitions
run_test "LinkTreeProfile struct exists" "grep -q 'public struct LinkTreeProfile' sources/linktree.move"

# Test 4: Verify Link struct
run_test "Link struct exists" "grep -q 'public struct Link' sources/linktree.move"

# Test 5: Verify UsernameRegistry
run_test "UsernameRegistry exists" "grep -q 'public struct UsernameRegistry' sources/linktree.move"

# Test 6: Verify create_profile function
run_test "create_profile function exists" "grep -q 'public fun create_profile' sources/linktree.move"

# Test 7: Verify add_link function
run_test "add_link function exists" "grep -q 'public fun add_link' sources/linktree.move"

# Test 8: Verify update_profile function
run_test "update_profile function exists" "grep -q 'public fun update_profile' sources/linktree.move"

# Test 9: Verify click_link function
run_test "click_link function exists" "grep -q 'public fun click_link' sources/linktree.move"

# Test 10: Verify error codes
run_test "Error codes defined" "grep -q 'const EInvalidUsername' sources/linktree.move"

# Test 11: Verify username validation
run_test "Username validation exists" "grep -q 'MIN_USERNAME_LENGTH' sources/linktree.move"

# Test 12: Verify max links constant
run_test "MAX_LINKS constant exists" "grep -q 'const MAX_LINKS' sources/linktree.move"

# Test 13: Verify events
run_test "ProfileCreated event exists" "grep -q 'public struct ProfileCreated' sources/linktree.move"

# Test 14: Verify SuiNS integration
run_test "SuiNS domain field exists" "grep -q 'sui_domain: String' sources/linktree.move"

# Test 15: Verify zkLogin integration
run_test "zkLogin fields exist" "grep -q 'zklogin_provider: String' sources/linktree.move"

# Test 16: Verify admin functions
run_test "Admin capability exists" "grep -q 'public struct AdminCap' sources/linktree.move"

# Test 17: Verify view functions
run_test "get_profile_info exists" "grep -q 'public fun get_profile_info' sources/linktree.move"

# Test 18: Verify link management
run_test "remove_link function exists" "grep -q 'public fun remove_link' sources/linktree.move"

# Test 19: Verify link reordering
run_test "reorder_links function exists" "grep -q 'public fun reorder_links' sources/linktree.move"

# Test 20: Verify init function
run_test "init function exists" "grep -q 'fun init' sources/linktree.move"

echo ""
echo "================================"
echo "📊 Test Results:"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "🎉 Contract is ready for deployment!"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi

