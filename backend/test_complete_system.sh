#!/bin/bash

# Complete HERMES System Test
# Tests Yield Indexer, Smart Router, Emissions, and Funding Rates

set -e

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 HERMES COMPLETE SYSTEM TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Test 1: Emissions API
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 1: Emission Schedules & Incentives"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

EMISSIONS_RESULT=$(curl -s "${BASE_URL}/api/emissions")

if echo "$EMISSIONS_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
  COUNT=$(echo "$EMISSIONS_RESULT" | jq -r '.count')
  echo "  Protocols with emission data: ${COUNT}"
  
  # Check Jito emissions
  JTO_EMISSIONS=$(curl -s "${BASE_URL}/api/emissions/jito")
  if echo "$JTO_EMISSIONS" | jq -e '.data.hasEmissions == true' > /dev/null 2>&1; then
    DAILY_RATE=$(echo "$JTO_EMISSIONS" | jq -r '.data.emissionSchedule.dailyRate')
    TOKEN=$(echo "$JTO_EMISSIONS" | jq -r '.data.emissionSchedule.token')
    APR_BOOST=$(echo "$JTO_EMISSIONS" | jq -r '.data.totalAPRBoost')
    
    echo "  Jito Emissions:"
    echo "    - Token: ${TOKEN}"
    echo "    - Daily Rate: ${DAILY_RATE} tokens/day"
    echo "    - APR Boost: +$(echo "$APR_BOOST * 100" | bc -l | xargs printf "%.2f")%"
    
    echo -e "${GREEN}✅ PASS: Emissions tracking working${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${RED}❌ FAIL: Jito emissions not found${NC}"
    ((FAIL_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: Emissions API not working${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 2: Active Emissions Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 2: Active Emissions Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ACTIVE_EMISSIONS=$(curl -s "${BASE_URL}/api/emissions/summary/active")

if echo "$ACTIVE_EMISSIONS" | jq -e '.success == true' > /dev/null 2>&1; then
  ACTIVE_COUNT=$(echo "$ACTIVE_EMISSIONS" | jq -r '.count')
  TOTAL_DAILY=$(echo "$ACTIVE_EMISSIONS" | jq -r '.totalDailyEmissions')
  
  echo "  Active emission programs: ${ACTIVE_COUNT}"
  echo "  Total daily emissions: $(printf "%.0f" "$TOTAL_DAILY") tokens/day"
  
  echo -e "${GREEN}✅ PASS: Active emissions summary working${NC}"
  ((PASS_COUNT++))
else
  echo -e "${RED}❌ FAIL: Active emissions summary failed${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 3: Incentive Programs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 3: Incentive Programs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INCENTIVES=$(curl -s "${BASE_URL}/api/emissions/incentives/all")

if echo "$INCENTIVES" | jq -e '.success == true' > /dev/null 2>&1; then
  INCENTIVE_COUNT=$(echo "$INCENTIVES" | jq -r '.count')
  
  echo "  Active incentive programs: ${INCENTIVE_COUNT}"
  echo "  Top 3 programs:"
  echo "$INCENTIVES" | jq -r '.data[0:3] | .[] | "    - \(.protocol): \(.name) (+\(.estimatedValue)% APY)"'
  
  echo -e "${GREEN}✅ PASS: Incentive programs tracked${NC}"
  ((PASS_COUNT++))
else
  echo -e "${RED}❌ FAIL: Incentive programs failed${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 4: Yield Indexer (Quick Check)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 4: Yield Indexer Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

YIELDS=$(curl -s "${BASE_URL}/api/yields")

if echo "$YIELDS" | jq -e '.success == true' > /dev/null 2>&1; then
  PROTOCOL_COUNT=$(echo "$YIELDS" | jq -r '.count')
  ZERO_TVL=$(echo "$YIELDS" | jq '[.data[] | select(.tvl == 0)] | length')
  
  echo "  Protocols indexed: ${PROTOCOL_COUNT}"
  echo "  Protocols with $0 TVL: ${ZERO_TVL}"
  
  if [ "$ZERO_TVL" -eq 0 ]; then
    echo -e "${GREEN}✅ PASS: No $0 TVL protocols${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  WARN: ${ZERO_TVL} protocols with $0 TVL${NC}"
    ((WARN_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: Yield indexer not responding${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 5: Smart Router (Quick Check)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 5: Smart Router Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROUTER_TEST=$(curl -s -X POST "${BASE_URL}/api/smart-route/calculate-real-yield" \
  -H "Content-Type: application/json" \
  -d '{"protocol": "marinade", "asset": "mSOL", "amount": 1000}')

if echo "$ROUTER_TEST" | jq -e '.success == true' > /dev/null 2>&1; then
  REAL_APY=$(echo "$ROUTER_TEST" | jq -r '.comparison.real_apy')
  ADVERTISED_APY=$(echo "$ROUTER_TEST" | jq -r '.comparison.advertised_apy')
  
  echo "  Marinade advertised: ${ADVERTISED_APY}"
  echo "  Marinade real yield: ${REAL_APY}"
  
  echo -e "${GREEN}✅ PASS: Smart router working${NC}"
  ((PASS_COUNT++))
else
  echo -e "${RED}❌ FAIL: Smart router failed${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 6: Funding Rates (Drift)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 6: Funding Rates (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if any perp protocol data exists
STABLE_YIELDS=$(curl -s "${BASE_URL}/api/yields")
PERP_COUNT=$(echo "$STABLE_YIELDS" | jq '[.data[] | select(.protocol == "drift" or .protocol == "zeta" or .protocol == "goosefx")] | length')

if [ "$PERP_COUNT" -gt 0 ]; then
  echo "  Perp protocols found: ${PERP_COUNT}"
  echo -e "${GREEN}✅ PASS: Funding rate data available${NC}"
  ((PASS_COUNT++))
else
  echo "  No perp funding rate data (APIs may be down)"
  echo -e "${YELLOW}⚠️  WARN: Funding rates not available (non-critical)${NC}"
  ((WARN_COUNT++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 COMPLETE SYSTEM TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASSED: ${PASS_COUNT}${NC}"
echo -e "${YELLOW}⚠️  WARNED: ${WARN_COUNT}${NC}"
echo -e "${RED}❌ FAILED: ${FAIL_COUNT}${NC}"
echo ""

TOTAL_TESTS=$((PASS_COUNT + WARN_COUNT + FAIL_COUNT))
PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL CRITICAL TESTS PASSED! (Pass rate: ${PASS_RATE}%)${NC}"
  echo ""
  echo -e "${BLUE}✅ Emission tracking: WORKING${NC}"
  echo -e "${BLUE}✅ Incentive programs: WORKING${NC}"
  echo -e "${BLUE}✅ Yield indexer: WORKING${NC}"
  echo -e "${BLUE}✅ Smart router: WORKING${NC}"
  echo -e "${BLUE}✅ Funding rates: OPTIONAL${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ SYSTEM HAS CRITICAL ISSUES (Pass rate: ${PASS_RATE}%)${NC}"
  exit 1
fi
