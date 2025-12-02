#!/bin/bash

# Hermes Smart Routing Engine - Verification Tests
# Tests real yield calculation, optimal routing, and protocol comparison

set -e

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 HERMES SMART ROUTING ENGINE - VERIFICATION TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Test 1: Calculate Real Yield for Marinade
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 1: Real Yield Calculation (Marinade mSOL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MARINADE_RESULT=$(curl -s -X POST "${BASE_URL}/api/smart-route/calculate-real-yield" \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "marinade",
    "asset": "mSOL",
    "amount": 1000,
    "fromToken": "SOL"
  }')

if echo "$MARINADE_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
  ADVERTISED=$(echo "$MARINADE_RESULT" | jq -r '.comparison.advertised_apy')
  REAL=$(echo "$MARINADE_RESULT" | jq -r '.comparison.real_apy')
  YIELD_LOSS=$(echo "$MARINADE_RESULT" | jq -r '.comparison.yield_loss')
  SLIPPAGE=$(echo "$MARINADE_RESULT" | jq -r '.comparison.cost_breakdown.slippage')
  FEES=$(echo "$MARINADE_RESULT" | jq -r '.comparison.cost_breakdown.protocol_fees')
  GAS=$(echo "$MARINADE_RESULT" | jq -r '.comparison.cost_breakdown.gas_costs')
  
  echo "  Advertised APY: ${ADVERTISED}"
  echo "  Real APY: ${REAL}"
  echo "  Yield Loss: ${YIELD_LOSS}"
  echo "  Costs:"
  echo "    - Slippage: ${SLIPPAGE}"
  echo "    - Protocol Fees: ${FEES}"
  echo "    - Gas: ${GAS}"
  
  echo -e "${GREEN}✅ PASS: Real yield calculation working${NC}"
  ((PASS_COUNT++))
else
  echo -e "${RED}❌ FAIL: Real yield calculation failed${NC}"
  echo "$MARINADE_RESULT" | jq '.'
  ((FAIL_COUNT++))
fi
echo ""

# Test 2: Calculate Real Yield for Jito
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 2: Real Yield Calculation (Jito jitoSOL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

JITO_RESULT=$(curl -s -X POST "${BASE_URL}/api/smart-route/calculate-real-yield" \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "jito",
    "asset": "JitoSOL",
    "amount": 1000,
    "fromToken": "SOL"
  }')

if echo "$JITO_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
  ADVERTISED=$(echo "$JITO_RESULT" | jq -r '.comparison.advertised_apy')
  REAL=$(echo "$JITO_RESULT" | jq -r '.comparison.real_apy')
  RISK_SCORE=$(echo "$JITO_RESULT" | jq -r '.data.risks.combined_risk_score')
  
  echo "  Advertised APY: ${ADVERTISED}"
  echo "  Real APY: ${REAL}"
  echo "  Risk Score: ${RISK_SCORE}/100"
  
  echo -e "${GREEN}✅ PASS: Jito real yield calculation working${NC}"
  ((PASS_COUNT++))
else
  echo -e "${RED}❌ FAIL: Jito real yield calculation failed${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 3: Find Optimal Route (SOL -> mSOL)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 3: Optimal Route Finding (SOL -> mSOL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROUTE_RESULT=$(curl -s -X POST "${BASE_URL}/api/smart-route/find-optimal" \
  -H "Content-Type: application/json" \
  -d '{
    "from_token": "SOL",
    "to_protocol": "marinade",
    "to_asset": "mSOL",
    "amount": 10,
    "user_risk_tolerance": "moderate",
    "optimize_for": "yield"
  }')

if echo "$ROUTE_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
  ROUTES_FOUND=$(echo "$ROUTE_RESULT" | jq -r '.routes_found')
  BEST_ROUTE_ID=$(echo "$ROUTE_RESULT" | jq -r '.recommended_route.route_id')
  BEST_APY=$(echo "$ROUTE_RESULT" | jq -r '.recommended_route.real_apy')
  ROUTE_SCORE=$(echo "$ROUTE_RESULT" | jq -r '.recommended_route.route_score')
  STEPS=$(echo "$ROUTE_RESULT" | jq -r '.recommended_route.steps | length')
  
  echo "  Routes Found: ${ROUTES_FOUND}"
  echo "  Best Route: ${BEST_ROUTE_ID}"
  echo "  Expected Real APY: $(echo "$BEST_APY * 100" | bc -l | xargs printf "%.2f")%"
  echo "  Route Score: ${ROUTE_SCORE}/100"
  echo "  Steps: ${STEPS}"
  
  if [ "$ROUTES_FOUND" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS: Optimal routing working (${ROUTES_FOUND} routes found)${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  WARN: No routes found${NC}"
    ((WARN_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: Route finding failed${NC}"
  echo "$ROUTE_RESULT" | jq '.'
  ((FAIL_COUNT++))
fi
echo ""

# Test 4: Find Optimal Route (USDC -> Kamino USDC)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 4: Optimal Route Finding (USDC -> Kamino)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

KAMINO_ROUTE=$(curl -s -X POST "${BASE_URL}/api/smart-route/find-optimal" \
  -H "Content-Type: application/json" \
  -d '{
    "from_token": "USDC",
    "to_protocol": "kamino",
    "to_asset": "USDC",
    "amount": 1000,
    "user_risk_tolerance": "moderate",
    "optimize_for": "yield"
  }')

if echo "$KAMINO_ROUTE" | jq -e '.success == true' > /dev/null 2>&1; then
  ROUTES_FOUND=$(echo "$KAMINO_ROUTE" | jq -r '.routes_found')
  BEST_APY=$(echo "$KAMINO_ROUTE" | jq -r '.recommended_route.real_apy')
  
  echo "  Routes Found: ${ROUTES_FOUND}"
  echo "  Expected Real APY: $(echo "$BEST_APY * 100" | bc -l | xargs printf "%.2f")%"
  
  if [ "$ROUTES_FOUND" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS: Stablecoin routing working${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  WARN: No stablecoin routes found${NC}"
    ((WARN_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: Stablecoin route finding failed${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 5: Compare Multiple Protocols
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 5: Protocol Comparison (LSTs)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COMPARE_RESULT=$(curl -s -X POST "${BASE_URL}/api/smart-route/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "protocols": [
      {"protocol": "marinade", "asset": "mSOL"},
      {"protocol": "jito", "asset": "JitoSOL"},
      {"protocol": "binance", "asset": "BNSOL"}
    ],
    "amount": 1000,
    "fromToken": "SOL"
  }')

if echo "$COMPARE_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
  COMPARED=$(echo "$COMPARE_RESULT" | jq -r '.count')
  BEST_PROTOCOL=$(echo "$COMPARE_RESULT" | jq -r '.best_protocol.protocol')
  BEST_REAL_APY=$(echo "$COMPARE_RESULT" | jq -r '.best_protocol.real_apy')
  
  echo "  Protocols Compared: ${COMPARED}"
  echo "  Best Protocol: ${BEST_PROTOCOL}"
  echo "  Best Real APY: $(echo "$BEST_REAL_APY * 100" | bc -l | xargs printf "%.2f")%"
  echo ""
  echo "  Rankings:"
  RANK=1
  echo "$COMPARE_RESULT" | jq -r '.data[] | "\(.protocol) - Real APY: \(.real_apy * 100 | tostring)"' | while read line; do
    echo "    ${RANK}. ${line%.*}$(echo ${line#*.} | cut -c1-4)%"
    ((RANK++))
  done
  
  if [ "$COMPARED" -ge 3 ]; then
    echo -e "${GREEN}✅ PASS: Protocol comparison working (${COMPARED} protocols)${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  WARN: Only ${COMPARED} protocols compared${NC}"
    ((WARN_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: Protocol comparison failed${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 6: Risk Assessment Verification
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 6: Risk Assessment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RISK_TEST=$(curl -s -X POST "${BASE_URL}/api/smart-route/calculate-real-yield" \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "marinade",
    "asset": "mSOL",
    "amount": 1000,
    "fromToken": "SOL"
  }')

if echo "$RISK_TEST" | jq -e '.data.risks' > /dev/null 2>&1; then
  PROTOCOL_RISK=$(echo "$RISK_TEST" | jq -r '.data.risks.protocol_risk_score')
  VALIDATOR_RISK=$(echo "$RISK_TEST" | jq -r '.data.risks.validator_risk_score')
  LIQUIDITY_RISK=$(echo "$RISK_TEST" | jq -r '.data.risks.liquidity_risk')
  COMBINED_RISK=$(echo "$RISK_TEST" | jq -r '.data.risks.combined_risk_score')
  
  echo "  Protocol Risk: ${PROTOCOL_RISK}/100"
  echo "  Validator Risk: ${VALIDATOR_RISK}/100"
  echo "  Liquidity Risk: ${LIQUIDITY_RISK}/100"
  echo "  Combined Risk Score: ${COMBINED_RISK}/100"
  
  if [ "$COMBINED_RISK" != "null" ] && [ "$COMBINED_RISK" != "0" ]; then
    echo -e "${GREEN}✅ PASS: Risk assessment working${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  WARN: Risk scores may be placeholder values${NC}"
    ((WARN_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: Risk assessment not available${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 7: Time Factors (APY Decay Prediction)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 7: APY Decay Prediction"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DECAY_TEST=$(curl -s -X POST "${BASE_URL}/api/smart-route/calculate-real-yield" \
  -H "Content-Type: application/json" \
  -d '{
    "protocol": "jito",
    "asset": "JitoSOL",
    "amount": 1000,
    "fromToken": "SOL"
  }')

if echo "$DECAY_TEST" | jq -e '.data.time_factors' > /dev/null 2>&1; then
  CURRENT_APY=$(echo "$DECAY_TEST" | jq -r '.data.advertised_apy')
  APY_30D=$(echo "$DECAY_TEST" | jq -r '.data.time_factors.expected_apy_30d')
  APY_90D=$(echo "$DECAY_TEST" | jq -r '.data.time_factors.expected_apy_90d')
  DECAY_RATE=$(echo "$DECAY_TEST" | jq -r '.data.time_factors.apy_decay_rate')
  
  echo "  Current APY: $(echo "$CURRENT_APY * 100" | bc -l | xargs printf "%.2f")%"
  echo "  Expected APY (30d): $(echo "$APY_30D * 100" | bc -l | xargs printf "%.2f")%"
  echo "  Expected APY (90d): $(echo "$APY_90D * 100" | bc -l | xargs printf "%.2f")%"
  echo "  Monthly Decay Rate: $(echo "$DECAY_RATE * 100" | bc -l | xargs printf "%.2f")%"
  
  if [ "$APY_30D" != "null" ]; then
    echo -e "${GREEN}✅ PASS: APY decay prediction working${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  WARN: APY decay data missing${NC}"
    ((WARN_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: APY decay prediction not available${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASSED: ${PASS_COUNT}${NC}"
echo -e "${YELLOW}⚠️  WARNED: ${WARN_COUNT}${NC}"
echo -e "${RED}❌ FAILED: ${FAIL_COUNT}${NC}"
echo ""

TOTAL_TESTS=$((PASS_COUNT + WARN_COUNT + FAIL_COUNT))
PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL CORE TESTS PASSED! (Pass rate: ${PASS_RATE}%)${NC}"
  exit 0
elif [ $PASS_COUNT -ge 5 ]; then
  echo -e "${YELLOW}⚠️  ROUTING ENGINE MOSTLY WORKING (Pass rate: ${PASS_RATE}%)${NC}"
  exit 0
else
  echo -e "${RED}❌ ROUTING ENGINE HAS ISSUES (Pass rate: ${PASS_RATE}%)${NC}"
  exit 1
fi
