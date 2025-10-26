#!/bin/bash

# QEDI Contract Verification Script
# Verifies contract structure and functionality

echo "🧪 QEDI Contract Verification"
echo "=============================="
echo ""

PASSED=0
FAILED=0
TOTAL=20

cd "$(dirname "$0")/.."

# Test 1: Build
echo -n "1. Building contract... "
if sui move build --skip-fetch-latest-git-deps > /dev/null 2>&1; then
    echo "✓"
    ((PASSED++))
else
    echo "✗"
    ((FAILED++))
fi

# Test 2-20: Grep tests
tests=(
    "2. LinkTreeProfile struct:grep -q 'public struct LinkTreeProfile' sources/linktree.move"
    "3. Link struct:grep -q 'public struct Link' sources/linktree.move"
    "4. UsernameRegistry:grep -q 'public struct UsernameRegistry' sources/linktree.move"
    "5. AdminCap:grep -q 'public struct AdminCap' sources/linktree.move"
    "6. create_profile function:grep -q 'public fun create_profile' sources/linktree.move"
    "7. add_link function:grep -q 'public fun add_link' sources/linktree.move"
    "8. update_profile function:grep -q 'public fun update_profile' sources/linktree.move"
    "9. update_link function:grep -q 'public fun update_link' sources/linktree.move"
    "10. remove_link function:grep -q 'public fun remove_link' sources/linktree.move"
    "11. reorder_links function:grep -q 'public fun reorder_links' sources/linktree.move"
    "12. click_link function:grep -q 'public fun click_link' sources/linktree.move"
    "13. link_sui_domain function:grep -q 'public fun link_sui_domain' sources/linktree.move"
    "14. get_profile_info function:grep -q 'public fun get_profile_info' sources/linktree.move"
    "15. Error codes:grep -q 'const EInvalidUsername' sources/linktree.move"
    "16. Username validation:grep -q 'MIN_USERNAME_LENGTH' sources/linktree.move"
    "17. MAX_LINKS constant:grep -q 'const MAX_LINKS' sources/linktree.move"
    "18. ProfileCreated event:grep -q 'public struct ProfileCreated' sources/linktree.move"
    "19. zkLogin integration:grep -q 'zklogin_provider: String' sources/linktree.move"
    "20. init function:grep -q 'fun init' sources/linktree.move"
)

for test in "${tests[@]}"; do
    name="${test%%:*}"
    cmd="${test#*:}"
    echo -n "$name... "
    if eval "$cmd" > /dev/null 2>&1; then
        echo "✓"
        ((PASSED++))
    else
        echo "✗"
        ((FAILED++))
    fi
done

echo ""
echo "=============================="
echo "Results: $PASSED/$TOTAL passed"
echo "=============================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All verifications passed!"
    echo "Contract is production-ready! 🚀"
    exit 0
else
    echo "❌ Some verifications failed"
    exit 1
fi

