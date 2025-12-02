#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 HERMES YIELD INDEXER - COMPREHENSIVE TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BASE_URL="http://localhost:3000"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0
WARN=0

# Helper functions
pass_test() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

fail_test() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

warn_test() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN++))
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 1: Server Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH=$(curl -s "$BASE_URL/health" | jq -r '.status')
if [ "$HEALTH" == "healthy" ]; then
    pass_test "Server is healthy"
else
    fail_test "Server is not healthy"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 2: LST Protocols (Liquid Staking Tokens)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test Marinade
echo -e "${BLUE}Testing Marinade...${NC}"
MARINADE=$(curl -s "$BASE_URL/api/yields?protocol=marinade" | jq '.data[0]')
MARINADE_TVL=$(echo "$MARINADE" | jq -r '.tvl')
MARINADE_APY=$(echo "$MARINADE" | jq -r '.apy')
if (( $(echo "$MARINADE_TVL > 100000000" | bc -l) )); then
    pass_test "Marinade TVL: \$$(echo "scale=0; $MARINADE_TVL / 1000000" | bc)M"
else
    fail_test "Marinade TVL too low: $MARINADE_TVL"
fi
echo "  APY: $(echo "scale=2; $MARINADE_APY * 100" | bc)%"

# Test Jito
echo -e "${BLUE}Testing Jito...${NC}"
JITO=$(curl -s "$BASE_URL/api/yields?protocol=jito" | jq '.data[0]')
JITO_TVL=$(echo "$JITO" | jq -r '.tvl')
JITO_APY=$(echo "$JITO" | jq -r '.apy')
if (( $(echo "$JITO_TVL > 100000000" | bc -l) )); then
    pass_test "Jito TVL: \$$(echo "scale=0; $JITO_TVL / 1000000" | bc)M"
else
    fail_test "Jito TVL too low: $JITO_TVL"
fi
echo "  APY: $(echo "scale=2; $JITO_APY * 100" | bc)%"

# Test Binance
echo -e "${BLUE}Testing Binance...${NC}"
BINANCE=$(curl -s "$BASE_URL/api/yields?protocol=binance" | jq '.data[0]')
BINANCE_TVL=$(echo "$BINANCE" | jq -r '.tvl')
BINANCE_APY=$(echo "$BINANCE" | jq -r '.apy')
if (( $(echo "$BINANCE_TVL > 100000000" | bc -l) )); then
    pass_test "Binance TVL: \$$(echo "scale=0; $BINANCE_TVL / 1000000" | bc)M"
else
    fail_test "Binance TVL too low: $BINANCE_TVL"
fi
echo "  APY: $(echo "scale=2; $BINANCE_APY * 100" | bc)%"

# Test Helius
echo -e "${BLUE}Testing Helius...${NC}"
HELIUS=$(curl -s "$BASE_URL/api/yields?protocol=helius" | jq '.data[0]')
HELIUS_TVL=$(echo "$HELIUS" | jq -r '.tvl')
HELIUS_APY=$(echo "$HELIUS" | jq -r '.apy')
if (( $(echo "$HELIUS_TVL > 1000000" | bc -l) )); then
    pass_test "Helius TVL: \$$(echo "scale=1; $HELIUS_TVL / 1000000" | bc)M"
else
    warn_test "Helius TVL low: \$$(echo "scale=1; $HELIUS_TVL / 1000000" | bc)M (expected >$1M)"
fi
echo "  APY: $(echo "scale=2; $HELIUS_APY * 100" | bc)%"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 3: Lending Protocols"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test MarginFi - Check for TVL duplication bug
echo -e "${BLUE}Testing MarginFi...${NC}"
MARGINFI_DATA=$(curl -s "$BASE_URL/api/yields?protocol=marginfi" | jq '.data')
MARGINFI_USDC_TVL=$(echo "$MARGINFI_DATA" | jq -r '.[] | select(.asset == "USDC") | .tvl')
MARGINFI_SOL_TVL=$(echo "$MARGINFI_DATA" | jq -r '.[] | select(.asset == "SOL") | .tvl')

echo "  USDC TVL: \$$(echo "scale=1; $MARGINFI_USDC_TVL / 1000000" | bc)M"
echo "  SOL TVL: \$$(echo "scale=1; $MARGINFI_SOL_TVL / 1000000" | bc)M"

if [ "$MARGINFI_USDC_TVL" == "$MARGINFI_SOL_TVL" ]; then
    fail_test "MarginFi TVL DUPLICATION BUG: USDC and SOL have same TVL"
else
    pass_test "MarginFi has unique TVL per asset"
fi

# Test Kamino - Check for TVL duplication bug
echo -e "${BLUE}Testing Kamino...${NC}"
KAMINO_DATA=$(curl -s "$BASE_URL/api/yields?protocol=kamino" | jq '.data')
KAMINO_USDC_TVL=$(echo "$KAMINO_DATA" | jq -r '.[] | select(.asset == "USDC") | .tvl')
KAMINO_LP_TVL=$(echo "$KAMINO_DATA" | jq -r '.[] | select(.asset == "USDC-USDT") | .tvl')

echo "  USDC TVL: \$$(echo "scale=1; $KAMINO_USDC_TVL / 1000000" | bc)M"
echo "  USDC-USDT TVL: \$$(echo "scale=1; $KAMINO_LP_TVL / 1000000" | bc)M"

if [ "$KAMINO_USDC_TVL" == "$KAMINO_LP_TVL" ]; then
    fail_test "Kamino TVL DUPLICATION BUG: All assets have same TVL"
else
    pass_test "Kamino has unique TVL per asset"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 4: Stablecoin AMM Pools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test Meteora
echo -e "${BLUE}Testing Meteora...${NC}"
METEORA_COUNT=$(curl -s "$BASE_URL/api/stables/category/stable-lp" | jq '[.data[] | select(.protocol == "meteora")] | length')
METEORA_TOP=$(curl -s "$BASE_URL/api/stables/top?limit=10" | jq '[.data[] | select(.protocol == "meteora")][0]')
METEORA_APY=$(echo "$METEORA_TOP" | jq -r '.apy')
echo "  Pool count: $METEORA_COUNT"
echo "  Top APY: $(echo "scale=1; $METEORA_APY * 100" | bc)%"
if [ "$METEORA_COUNT" -gt 0 ]; then
    pass_test "Meteora pools found"
else
    fail_test "No Meteora pools"
fi

# Test Raydium
echo -e "${BLUE}Testing Raydium...${NC}"
RAYDIUM_COUNT=$(curl -s "$BASE_URL/api/stables/category/stable-lp" | jq '[.data[] | select(.protocol == "raydium")] | length')
echo "  Pool count: $RAYDIUM_COUNT"
if [ "$RAYDIUM_COUNT" -gt 0 ]; then
    pass_test "Raydium pools found"
else
    warn_test "No Raydium pools found"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 5: Validator Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

VAL_DATA=$(curl -s "$BASE_URL/api/validators/health")
MARINADE_VALS=$(echo "$VAL_DATA" | jq -r '.data.marinade.totalValidators')
JITO_VALS=$(echo "$VAL_DATA" | jq -r '.data.jito.numberOfValidators')

echo "  Marinade validators: $MARINADE_VALS"
echo "  Jito validators: $JITO_VALS"

if [ "$MARINADE_VALS" -gt 100 ]; then
    pass_test "Marinade validator data accurate"
else
    fail_test "Marinade validator count too low"
fi

if [ "$JITO_VALS" -gt 100 ]; then
    pass_test "Jito validator data accurate"
else
    fail_test "Jito validator count too low"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 6: Hermes Index Aggregation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INDEX_DATA=$(curl -s "$BASE_URL/api/hermes-index")
TOTAL_PROTOCOLS=$(echo "$INDEX_DATA" | jq -r '.metrics.totalProtocols')
TOTAL_TVL=$(echo "$INDEX_DATA" | jq -r '.metrics.totalTVL')
LST_COUNT=$(echo "$INDEX_DATA" | jq -r '.metrics.categories.LST')
STABLE_LP_COUNT=$(echo "$INDEX_DATA" | jq -r '.metrics.categories.stableLP')

echo "  Total protocols: $TOTAL_PROTOCOLS"
echo "  Total TVL: \$$(echo "scale=1; $TOTAL_TVL / 1000000000" | bc)B"
echo "  LST count: $LST_COUNT"
echo "  Stable LP count: $STABLE_LP_COUNT"

if [ "$TOTAL_PROTOCOLS" -ge 10 ]; then
    pass_test "Protocol count good: $TOTAL_PROTOCOLS"
else
    fail_test "Too few protocols: $TOTAL_PROTOCOLS"
fi

if (( $(echo "$TOTAL_TVL > 1000000000" | bc -l) )); then
    pass_test "TVL > $1B"
else
    warn_test "TVL seems low: \$$(echo "scale=1; $TOTAL_TVL / 1000000000" | bc)B"
fi

if [ "$STABLE_LP_COUNT" -lt 100 ]; then
    pass_test "Stable LP count reasonable: $STABLE_LP_COUNT (no massive duplication)"
else
    fail_test "Too many stable LPs (duplication bug?): $STABLE_LP_COUNT"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 7: Data Quality Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for $0 TVL protocols
ZERO_TVL_COUNT=$(curl -s "$BASE_URL/api/yields" | jq '[.data[] | select(.tvl == 0)] | length')
echo "  Protocols with \$0 TVL: $ZERO_TVL_COUNT"
if [ "$ZERO_TVL_COUNT" -eq 0 ]; then
    pass_test "No protocols with \$0 TVL"
elif [ "$ZERO_TVL_COUNT" -lt 3 ]; then
    warn_test "$ZERO_TVL_COUNT protocols have \$0 TVL"
else
    fail_test "Too many protocols with \$0 TVL: $ZERO_TVL_COUNT"
fi

# Check for duplicate TVL values (indicates bug)
DUPLICATE_TVL=$(curl -s "$BASE_URL/api/yields" | jq '[.data | group_by(.tvl) | .[] | select(length > 3)] | length')
echo "  Suspected TVL duplications: $DUPLICATE_TVL"
if [ "$DUPLICATE_TVL" -gt 0 ]; then
    fail_test "Found $DUPLICATE_TVL groups of protocols with identical TVL (duplication bug)"
else
    pass_test "No suspicious TVL duplications"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASSED: $PASS${NC}"
echo -e "${YELLOW}⚠️  WARNED: $WARN${NC}"
echo -e "${RED}❌ FAILED: $FAIL${NC}"
echo ""

TOTAL=$((PASS + WARN + FAIL))
PASS_RATE=$((PASS * 100 / TOTAL))

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! (Pass rate: ${PASS_RATE}%)${NC}"
    exit 0
elif [ "$FAIL" -lt 3 ]; then
    echo -e "${YELLOW}⚠️  SOME ISSUES FOUND (Pass rate: ${PASS_RATE}%)${NC}"
    exit 1
else
    echo -e "${RED}❌ MULTIPLE FAILURES (Pass rate: ${PASS_RATE}%)${NC}"
    exit 1
fi
