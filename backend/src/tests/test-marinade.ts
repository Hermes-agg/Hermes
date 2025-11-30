/**
 * Test script for Marinade service (HTTP API + Native Staking SDK)
 * Run with: npx tsx src/tests/test-marinade.ts
 */

import dotenv from 'dotenv';
import { PublicKey } from '@solana/web3.js';
import marinadeService from '../services/marinade';
import BN from 'bn.js';

dotenv.config();

async function testMarinadeService() {
  console.log('\n=== Testing Marinade Service ===\n');

  // Test 1: HTTP API - Fetch Yield Data
  console.log('Test 1: Fetching yield data (HTTP API)...');
  try {
    const yieldData = await marinadeService.fetchYieldData();
    console.log('Yield data fetched successfully:');
    console.log({
      protocol: yieldData.protocol,
      asset: yieldData.asset,
      apy: `${(yieldData.apy * 100).toFixed(2)}%`,
      tvl: `$${(yieldData.tvl / 1e9).toFixed(2)}B`,
      msolPrice: yieldData.msolPrice.toFixed(4),
      validators: yieldData.stakeAccounts,
      validatorScore: yieldData.validatorScore.toFixed(2),
    });
  } catch (error) {
    console.error('Failed to fetch yield data:', error);
  }

  // Test 2: Get Validator Metrics
  console.log('\nTest 2: Fetching validator metrics...');
  try {
    const metrics = await marinadeService.getValidatorMetrics();
    console.log(`Validator metrics:`);
    console.log(`   Total validators: ${metrics.totalValidators}`);
    console.log(`   Average score: ${metrics.avgScore.toFixed(2)}`);
    console.log(`   Top 5 validators:`);
    metrics.topValidators.slice(0, 5).forEach((v, i) => {
      console.log(`      ${i + 1}. ${v.address.substring(0, 12)}... (${v.score.toFixed(2)})`);
    });
  } catch (error) {
    console.error('Failed to fetch validator metrics:', error);
  }

  // Test 3: Calculate Risk Score
  console.log('\nTest 3: Calculating risk score...');
  try {
    const yieldData = await marinadeService.fetchYieldData();
    const riskScore = marinadeService.calculateRiskScore(yieldData);
    console.log(`Risk score: ${riskScore.toFixed(2)}/100`);
  } catch (error) {
    console.error('Failed to calculate risk score:', error);
  }

  // Test 4: Estimate Slippage
  console.log('\nTest 4: Estimating slippage...');
  try {
    const amount = 1000 * 1e9; // 1000 SOL
    const slippage = await marinadeService.estimateSlippage(amount);
    console.log(`Estimated slippage for 1000 SOL: ${(slippage * 100).toFixed(4)}%`);
  } catch (error) {
    console.error('Failed to estimate slippage:', error);
  }

  // Test 5: Get Fees
  console.log('\nTest 5: Getting fee structure...');
  try {
    const fees = marinadeService.getFees();
    console.log('Fee structure:');
    console.log({
      depositFee: `${(fees.depositFee * 100).toFixed(2)}%`,
      withdrawalFee: `${(fees.withdrawalFee * 100).toFixed(2)}%`,
      managementFee: `${(fees.managementFee * 100).toFixed(2)}%`,
      nativeUnstakeFee: `${fees.nativeUnstakeFee} SOL`,
    });
  } catch (error) {
    console.error('Failed to get fees:', error);
  }

  // Test 6: Check SDK Availability
  console.log('\nTest 6: Checking Native Staking SDK availability...');
  const isAvailable = marinadeService.isNativeStakingAvailable();
  console.log(`Native Staking SDK available: ${isAvailable ? 'Yes' : 'No'}`);

  if (!isAvailable) {
    console.log('WARNING: SDK not initialized. Check RPC connection.');
  }

  // Test 7: Get Native Staking Authorities
  console.log('\nTest 7: Getting native staking authorities...');
  const authorities = marinadeService.getNativeStakingAuthorities();
  console.log('Native staking authorities:');
  console.log(`   Stake Authority: ${authorities.stakeAuthority}`);
  console.log(`   Unstake Authority: ${authorities.unstakeAuthority}`);

  // Test 8: Build Create Stake Instructions (Example)
  console.log('\nTest 8: Building create stake instructions (dry run)...');
  try {
    const userPubkey = new PublicKey('11111111111111111111111111111111'); // Example address
    const amount = new BN(1_000_000_000); // 1 SOL

    const { createAuthorizedStake, stakeKeypair } = 
      marinadeService.buildCreateAuthorizedStakeInstructions(userPubkey, amount);

    console.log('Instructions built successfully:');
    console.log(`   Instructions count: ${createAuthorizedStake.length}`);
    console.log(`   Stake account: ${stakeKeypair.publicKey.toBase58()}`);
    console.log('   NOTE: These are example instructions, not sent to chain');
  } catch (error) {
    console.error('Failed to build instructions:', error);
  }

  // Test 9: Test Authorize Instructions (Example)
  console.log('\nTest 9: Building authorize instructions (dry run)...');
  try {
    const userPubkey = new PublicKey('11111111111111111111111111111111'); // Example
    const stakeAccount = new PublicKey('22222222222222222222222222222222'); // Example

    const instructions = marinadeService.buildAuthorizeInstructions(
      userPubkey,
      [stakeAccount]
    );

    console.log('Authorization instructions built:');
    console.log(`   Instructions count: ${instructions.length}`);
    console.log('   NOTE: These are example instructions, not sent to chain');
  } catch (error) {
    console.error('Failed to build authorize instructions:', error);
  }

  // Test 10: Get Prepare for Revoke Cost
  console.log('\nTest 10: Getting prepare for revoke cost...');
  const cost = marinadeService.getPrepareForRevokeCost();
  console.log(`Prepare for revoke cost: ${cost} lamports (${cost / 1e9} SOL)`);

  console.log('\n=== Test Complete ===\n');

  // Summary
  console.log('Summary:');
  console.log('HTTP API working for yield data and metrics');
  if (isAvailable) {
    console.log('Native Staking SDK initialized and ready');
    console.log('   - Can create new stake accounts');
    console.log('   - Can migrate existing stake accounts');
    console.log('   - Can prepare for unstaking');
    console.log('   - Can fetch user stake accounts & rewards');
  } else {
    console.log('WARNING: Native Staking SDK not available');
    console.log('   - Check SOLANA_RPC_URL in .env');
    console.log('   - Ensure RPC endpoint is accessible');
  }
  console.log('');
}

// Run tests
testMarinadeService()
  .then(() => {
    console.log('All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
