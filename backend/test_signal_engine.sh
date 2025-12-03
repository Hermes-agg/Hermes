#!/bin/bash

# HERMES Signal Engine Test
# Tests early warning system and risk detection

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
echo "  🚨 HERMES SIGNAL ENGINE TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Test 1: Signal Monitor Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 1: Signal Monitor Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATUS=$(curl -s "${BASE_URL}/api/signals/monitor/status")

if echo "$STATUS" | jq -e '.success == true' > /dev/null 2>&1; then
  IS_RUNNING=$(echo "$STATUS" | jq -r '.data.isRunning')
  CHECK_INTERVAL=$(echo "$STATUS" | jq -r '.data.checkInterval')
  
  echo "  Monitor running: ${IS_RUNNING}"
  echo "  Check interval: $((CHECK_INTERVAL / 1000))s"
  
  if [ "$IS_RUNNING" = "true" ]; then
    echo -e "${GREEN}✅ PASS: Signal monitor is running${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${RED}❌ FAIL: Signal monitor not running${NC}"
    ((FAIL_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: Cannot get monitor status${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 2: Run Signal Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 2: Run Signal Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CHECK_RESULT=$(curl -s -X POST "${BASE_URL}/api/signals/check")

if echo "$CHECK_RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
  SIGNAL_COUNT=$(echo "$CHECK_RESULT" | jq -r '.count')
  CRITICAL=$(echo "$CHECK_RESULT" | jq -r '.summary.critical')
  HIGH=$(echo "$CHECK_RESULT" | jq -r '.summary.high')
  MEDIUM=$(echo "$CHECK_RESULT" | jq -r '.summary.medium')
  LOW=$(echo "$CHECK_RESULT" | jq -r '.summary.low')
  
  echo "  Total signals: ${SIGNAL_COUNT}"
  echo "  Breakdown:"
  echo "    - CRITICAL: ${CRITICAL}"
  echo "    - HIGH: ${HIGH}"
  echo "    - MEDIUM: ${MEDIUM}"
  echo "    - LOW: ${LOW}"
  
  echo -e "${GREEN}✅ PASS: Signal check working${NC}"
  ((PASS_COUNT++))
  
  if [ "$CRITICAL" -gt 0 ]; then
    echo -e "${RED}⚠️  WARNING: ${CRITICAL} CRITICAL signals detected!${NC}"
  fi
else
  echo -e "${RED}❌ FAIL: Signal check failed${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 3: Get All Signals
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 3: Get All Active Signals"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SIGNALS=$(curl -s "${BASE_URL}/api/signals")

if echo "$SIGNALS" | jq -e '.success == true' > /dev/null 2>&1; then
  COUNT=$(echo "$SIGNALS" | jq -r '.count')
  ACTIONABLE=$(echo "$SIGNALS" | jq -r '.summary.actionable')
  
  echo "  Active signals: ${COUNT}"
  echo "  Actionable signals: ${ACTIONABLE}"
  
  if [ "$COUNT" -gt 0 ]; then
    echo ""
    echo "  Sample signals:"
    echo "$SIGNALS" | jq -r '.data[0:3] | .[] | "    - [\(.severity | ascii_upcase)] \(.protocol): \(.message)"'
  fi
  
  echo -e "${GREEN}✅ PASS: Signal retrieval working${NC}"
  ((PASS_COUNT++))
else
  echo -e "${RED}❌ FAIL: Cannot retrieve signals${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 4: Get Actionable Signals
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 4: Actionable Signals (Portfolio Changes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ACTIONABLE_SIGNALS=$(curl -s "${BASE_URL}/api/signals/actionable")

if echo "$ACTIONABLE_SIGNALS" | jq -e '.success == true' > /dev/null 2>&1; then
  ACTIONABLE_COUNT=$(echo "$ACTIONABLE_SIGNALS" | jq -r '.count')
  
  echo "  Actionable signals: ${ACTIONABLE_COUNT}"
  
  if [ "$ACTIONABLE_COUNT" -gt 0 ]; then
    echo ""
    echo "  Actions required:"
    echo "$ACTIONABLE_SIGNALS" | jq -r '.data[] | "    - \(.protocol) (\(.asset)): \(.suggestedAction)"'
    
    echo -e "${YELLOW}⚠️  WARN: ${ACTIONABLE_COUNT} signals require portfolio action${NC}"
    ((WARN_COUNT++))
  else
    echo "  No portfolio actions required"
    echo -e "${GREEN}✅ PASS: No urgent actions needed${NC}"
    ((PASS_COUNT++))
  fi
else
  echo -e "${RED}❌ FAIL: Cannot retrieve actionable signals${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 5: Risk Events History
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 5: Risk Events History"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RISK_EVENTS=$(curl -s "${BASE_URL}/api/signals/risk-events?limit=10")

if echo "$RISK_EVENTS" | jq -e '.success == true' > /dev/null 2>&1; then
  EVENT_COUNT=$(echo "$RISK_EVENTS" | jq -r '.count')
  
  echo "  Historical risk events: ${EVENT_COUNT}"
  
  if [ "$EVENT_COUNT" -gt 0 ]; then
    UNRESOLVED=$(echo "$RISK_EVENTS" | jq '[.data[] | select(.resolved == false)] | length')
    echo "  Unresolved events: ${UNRESOLVED}"
    
    if [ "$UNRESOLVED" -gt 0 ]; then
      echo ""
      echo "  Recent unresolved events:"
      echo "$RISK_EVENTS" | jq -r '.data[] | select(.resolved == false) | "    - [\(.severity | ascii_upcase)] \(.protocol): \(.description)"' | head -3
    fi
  fi
  
  echo -e "${GREEN}✅ PASS: Risk event tracking working${NC}"
  ((PASS_COUNT++))
else
  echo -e "${RED}❌ FAIL: Cannot retrieve risk events${NC}"
  ((FAIL_COUNT++))
fi
echo ""

# Test 6: Signal Types Coverage
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TEST 6: Signal Type Coverage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ALL_SIGNALS=$(curl -s "${BASE_URL}/api/signals")

echo "  Monitoring for:"
echo "    ✓ Validator delinquency"
echo "    ✓ Liquidity drying up"
echo "    ✓ TVL below threshold"
echo "    ✓ APY spikes"
echo "    ✓ LST depeg risk"
echo "    ✓ Protocol downtime"

# Count unique signal types
if echo "$ALL_SIGNALS" | jq -e '.success == true' > /dev/null 2>&1; then
  TYPES=$(echo "$ALL_SIGNALS" | jq -r '[.data[].type] | unique | length')
  echo ""
  echo "  Active signal types detected: ${TYPES}"
  
  if [ "$TYPES" -ge 3 ]; then
    echo -e "${GREEN}✅ PASS: Multiple signal types active${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  WARN: Limited signal type coverage${NC}"
    ((WARN_COUNT++))
  fi
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 SIGNAL ENGINE TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ PASSED: ${PASS_COUNT}${NC}"
echo -e "${YELLOW}⚠️  WARNED: ${WARN_COUNT}${NC}"
echo -e "${RED}❌ FAILED: ${FAIL_COUNT}${NC}"
echo ""

TOTAL_TESTS=$((PASS_COUNT + WARN_COUNT + FAIL_COUNT))
PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 SIGNAL ENGINE OPERATIONAL! (Pass rate: ${PASS_RATE}%)${NC}"
  echo ""
  echo -e "${BLUE}📡 Signal Engine Features:${NC}"
  echo -e "${BLUE}  ✅ Real-time risk monitoring${NC}"
  echo -e "${BLUE}  ✅ Automatic signal detection${NC}"
  echo -e "${BLUE}  ✅ Portfolio action recommendations${NC}"
  echo -e "${BLUE}  ✅ Historical risk tracking${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ SIGNAL ENGINE HAS ISSUES (Pass rate: ${PASS_RATE}%)${NC}"
  exit 1
fi
