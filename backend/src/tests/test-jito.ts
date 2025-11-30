/**
 * Test script for Jito SDK integration
 * Run with: npx tsx src/tests/test-jito.ts
 */

import dotenv from 'dotenv';
import jitoService from '../services/jito';

dotenv.config();

async function testJitoService() {
  console.log('\n=== Testing Jito Service ===\n');

  // Test 1: HTTP API - Fetch Yield Data
  console.log(' Test 1: Fetching yield data (HTTP API)...');
  try {
    const yieldData = await jitoService.fetchYieldData();
    console.log(' Yield data fetched successfully:');
    console.log({
      protocol: yieldData.protocol,
      asset: yieldData.asset,
      apy: `${(yieldData.apy * 100).toFixed(2)}%`,
      tvl: `$${(yieldData.tvl / 1e6).toFixed(2)}M`,
      mevRewards: `${(yieldData.mevRewards * 100).toFixed(2)}%`,
      jitosolPrice: yieldData.jitosolPrice,
    });
  } catch (error) {
    console.error(' Failed to fetch yield data:', error);
  }

  // Test 2: Check SDK availability
  console.log('\n Test 2: Checking SDK availability...');
  const isAvailable = jitoService.isSearcherClientAvailable();
  console.log(`SearcherClient available: ${isAvailable ? ' Yes' : ' No'}`);

  if (!isAvailable) {
    console.log('  SDK not available. Make sure JITO_BLOCK_ENGINE_URL is set in .env');
    console.log('   Example: JITO_BLOCK_ENGINE_URL="frankfurt.mainnet.block-engine.jito.wtf"');
  }

  // Test 3: SDK - Get Tip Accounts
  console.log('\n Test 3: Fetching tip accounts (SDK)...');
  try {
    const tipAccounts = await jitoService.getTipAccounts();
    if (tipAccounts.length > 0) {
      console.log(` Fetched ${tipAccounts.length} tip accounts:`);
      tipAccounts.forEach((account, i) => {
        console.log(`   ${i + 1}. ${account}`);
      });
    } else {
      console.log('  No tip accounts returned (SDK may not be initialized)');
    }
  } catch (error) {
    console.error(' Failed to fetch tip accounts:', error);
  }

  // Test 4: SDK - Get Random Tip Account
  console.log('\n🎲 Test 4: Getting random tip account...');
  try {
    const randomTip = await jitoService.getRandomTipAccount();
    if (randomTip) {
      console.log(` Random tip account: ${randomTip}`);
    } else {
      console.log('  No random tip account available');
    }
  } catch (error) {
    console.error(' Failed to get random tip account:', error);
  }

  // Test 5: SDK - Get Connected Leaders
  console.log('\n👑 Test 5: Fetching connected leaders (SDK)...');
  try {
    const leaders = await jitoService.getConnectedLeaders();
    console.log(' Connected leaders data:');
    console.log(JSON.stringify(leaders, null, 2));
  } catch (error) {
    console.error(' Failed to fetch connected leaders:', error);
  }

  // Test 6: SDK - Get Next Scheduled Leader
  console.log('\n  Test 6: Fetching next scheduled leader (SDK)...');
  try {
    const nextLeader = await jitoService.getNextScheduledLeader();
    if (nextLeader) {
      console.log(' Next scheduled leader:');
      console.log(JSON.stringify(nextLeader, null, 2));
    } else {
      console.log('  No next leader data available');
    }
  } catch (error) {
    console.error(' Failed to fetch next scheduled leader:', error);
  }

  // Test 7: HTTP API - Get MEV Rewards Breakdown
  console.log('\n📈 Test 7: Fetching MEV rewards breakdown (HTTP API)...');
  try {
    const mevRewards = await jitoService.getMevRewardsBreakdown();
    console.log(' MEV rewards breakdown:');
    console.log({
      daily: `${(mevRewards.daily * 100).toFixed(2)}%`,
      weekly: `${(mevRewards.weekly * 100).toFixed(2)}%`,
      monthly: `${(mevRewards.monthly * 100).toFixed(2)}%`,
      dataPoints: mevRewards.breakdown.length,
    });
  } catch (error) {
    console.error(' Failed to fetch MEV rewards:', error);
  }

  // Test 8: Calculate Risk Score
  console.log('\n  Test 8: Calculating risk score...');
  try {
    const yieldData = await jitoService.fetchYieldData();
    const riskScore = jitoService.calculateRiskScore(yieldData);
    console.log(` Risk score: ${riskScore.toFixed(2)}/100`);
  } catch (error) {
    console.error(' Failed to calculate risk score:', error);
  }

  // Test 9: Get Fees
  console.log('\n Test 9: Getting fee structure...');
  try {
    const fees = jitoService.getFees();
    console.log(' Fee structure:');
    console.log({
      depositFee: `${(fees.depositFee * 100).toFixed(2)}%`,
      withdrawalFee: `${(fees.withdrawalFee * 100).toFixed(2)}%`,
      managementFee: `${(fees.managementFee * 100).toFixed(2)}%`,
      mevFee: `${(fees.mevFee * 100).toFixed(2)}%`,
    });
  } catch (error) {
    console.error(' Failed to get fees:', error);
  }

  // Test 10: Get Stake Pool Info
  console.log('\n🏊 Test 10: Fetching stake pool info (HTTP API)...');
  try {
    const poolInfo = await jitoService.getStakePoolInfo();
    console.log(' Stake pool info:');
    console.log({
      totalStaked: `${(poolInfo.totalStaked / 1e9).toFixed(2)} SOL`,
      numberOfValidators: poolInfo.numberOfValidators,
      averagePerformance: `${(poolInfo.averageValidatorPerformance * 100).toFixed(2)}%`,
    });
  } catch (error) {
    console.error(' Failed to fetch stake pool info:', error);
  }

  console.log('\n=== Test Complete ===\n');
}

// Run tests
testJitoService()
  .then(() => {
    console.log(' All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error(' Test suite failed:', error);
    process.exit(1);
  });
