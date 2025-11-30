/**
 * Test script for Data Indexer
 * Tests yield collection, database storage, and data retrieval
 * Run with: npx tsx src/tests/test-indexer.ts
 */

import dotenv from 'dotenv';
import { prisma } from '../db/prisma';

dotenv.config();

async function testDataIndexer() {
  console.log('\n=== Testing Data Indexer ===\n');

  // Test 1: Check database connection
  console.log(' Test 1: Database connection...');
  try {
    await prisma.$connect();
    console.log(' Database connected successfully');
  } catch (error) {
    console.error(' Database connection failed:', error);
    process.exit(1);
  }

  // Test 2: Check yield records
  console.log('\n Test 2: Checking yield records...');
  try {
    const totalRecords = await prisma.yieldRecord.count();
    console.log(` Total yield records in database: ${totalRecords}`);

    if (totalRecords === 0) {
      console.log('  No yield records found. The indexer may not have run yet.');
      console.log('   Run the server with: npm run dev');
    } else {
      // Get latest records
      const latestRecords = await prisma.yieldRecord.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        select: {
          protocol: true,
          asset: true,
          apy: true,
          tvl: true,
          riskScore: true,
          timestamp: true,
        },
      });

      console.log('\n📈 Latest 10 yield records:');
      latestRecords.forEach((record, i) => {
        console.log(`   ${i + 1}. ${record.protocol.toUpperCase()} - ${record.asset}`);
        console.log(`      APY: ${(record.apy * 100).toFixed(2)}%`);
        console.log(`      TVL: $${(record.tvl / 1e6).toFixed(2)}M`);
        console.log(`      Risk: ${record.riskScore.toFixed(1)}/100`);
        console.log(`      Time: ${record.timestamp.toISOString()}`);
      });
    }
  } catch (error) {
    console.error(' Error checking yield records:', error);
  }

  // Test 3: Check protocol metadata
  console.log('\n🏢 Test 3: Checking protocol metadata...');
  try {
    const protocols = await prisma.protocolMetadata.findMany({
      orderBy: { lastSuccessfulFetch: 'desc' },
    });

    console.log(` Found ${protocols.length} protocols:\n`);
    protocols.forEach((protocol) => {
      const status = protocol.isActive ? '' : '';
      const lastFetch = protocol.lastSuccessfulFetch
        ? new Date(protocol.lastSuccessfulFetch).toLocaleString()
        : 'Never';
      const failures = protocol.consecutiveFailures || 0;

      console.log(`   ${status} ${protocol.name}`);
      console.log(`      Last fetch: ${lastFetch}`);
      console.log(`      Health: ${protocol.healthScore || 100}/100`);
      console.log(`      Failures: ${failures}`);
      if (!protocol.isActive) {
        console.log(`        INACTIVE`);
      }
      if (protocol.isBlacklisted) {
        console.log(`       BLACKLISTED`);
      }
    });
  } catch (error) {
    console.error(' Error checking protocol metadata:', error);
  }

  // Test 4: Check data by protocol
  console.log('\n📦 Test 4: Yield records by protocol...');
  try {
    const protocolStats = await prisma.yieldRecord.groupBy({
      by: ['protocol'],
      _count: { protocol: true },
      _avg: { apy: true, tvl: true, riskScore: true },
    });

    console.log(' Protocol statistics:\n');
    protocolStats.forEach((stat) => {
      console.log(`   ${stat.protocol.toUpperCase()}`);
      console.log(`      Records: ${stat._count.protocol}`);
      console.log(`      Avg APY: ${((stat._avg.apy || 0) * 100).toFixed(2)}%`);
      console.log(`      Avg TVL: $${((stat._avg.tvl || 0) / 1e6).toFixed(2)}M`);
      console.log(`      Avg Risk: ${(stat._avg.riskScore || 0).toFixed(1)}/100`);
    });
  } catch (error) {
    console.error(' Error checking protocol stats:', error);
  }

  // Test 5: Check recent data freshness
  console.log('\n⏰ Test 5: Checking data freshness...');
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentRecords = await prisma.yieldRecord.count({
      where: {
        timestamp: {
          gte: fiveMinutesAgo,
        },
      },
    });

    if (recentRecords > 0) {
      console.log(` ${recentRecords} records from the last 5 minutes (indexer is active)`);
    } else {
      const latestRecord = await prisma.yieldRecord.findFirst({
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });

      if (latestRecord) {
        const minutesAgo = Math.floor(
          (Date.now() - latestRecord.timestamp.getTime()) / 1000 / 60
        );
        console.log(`  Latest data is ${minutesAgo} minutes old`);
        console.log('   The indexer may not be running. Start with: npm run dev');
      } else {
        console.log('  No data found. Indexer has not run yet.');
      }
    }
  } catch (error) {
    console.error(' Error checking data freshness:', error);
  }

  // Test 6: Check DPO jobs
  console.log('\n🤖 Test 6: Checking DPO jobs...');
  try {
    const totalJobs = await prisma.dPOJob.count();
    const pendingJobs = await prisma.dPOJob.count({
      where: { status: 'pending' },
    });
    const completedJobs = await prisma.dPOJob.count({
      where: { status: 'completed' },
    });

    console.log(` Total DPO jobs: ${totalJobs}`);
    console.log(`   Pending: ${pendingJobs}`);
    console.log(`   Completed: ${completedJobs}`);

    if (totalJobs > 0) {
      const recentJobs = await prisma.dPOJob.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          action: true,
          status: true,
          createdAt: true,
        },
      });

      console.log('\n   Recent DPO jobs:');
      recentJobs.forEach((job, i) => {
        console.log(`      ${i + 1}. ${job.action} - ${job.status}`);
      });
    }
  } catch (error) {
    console.error(' Error checking DPO jobs:', error);
  }

  // Test 7: Check portfolios
  console.log('\n Test 7: Checking portfolios...');
  try {
    const totalPortfolios = await prisma.portfolio.count();
    console.log(` Total portfolios: ${totalPortfolios}`);

    if (totalPortfolios > 0) {
      const portfolios = await prisma.portfolio.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          riskProfile: true,
          lastRebalance: true,
          createdAt: true,
        },
      });

      console.log('\n   Recent portfolios:');
      portfolios.forEach((p, i) => {
        console.log(`      ${i + 1}. Portfolio ${p.id.substring(0, 8)}...`);
        console.log(`         Risk Profile: ${p.riskProfile}`);
        console.log(`         Last Rebalance: ${p.lastRebalance?.toLocaleString() || 'Never'}`);
      });
    }
  } catch (error) {
    console.error(' Error checking portfolios:', error);
  }

  // Test 8: Test time-series query
  console.log('\n📈 Test 8: Time-series analysis (last 24 hours)...');
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const timeSeriesData = await prisma.yieldRecord.findMany({
      where: {
        timestamp: {
          gte: oneDayAgo,
        },
        protocol: 'jito', // Example protocol
      },
      orderBy: { timestamp: 'asc' },
      select: {
        apy: true,
        tvl: true,
        timestamp: true,
      },
    });

    if (timeSeriesData.length > 0) {
      console.log(` Found ${timeSeriesData.length} data points for Jito in last 24h`);
      console.log(`   APY range: ${(Math.min(...timeSeriesData.map(d => d.apy)) * 100).toFixed(2)}% - ${(Math.max(...timeSeriesData.map(d => d.apy)) * 100).toFixed(2)}%`);
      console.log(`   TVL range: $${(Math.min(...timeSeriesData.map(d => d.tvl)) / 1e6).toFixed(2)}M - $${(Math.max(...timeSeriesData.map(d => d.tvl)) / 1e6).toFixed(2)}M`);
    } else {
      console.log('  No time-series data available yet (needs >24h of collection)');
    }
  } catch (error) {
    console.error(' Error in time-series analysis:', error);
  }

  // Test 9: Check risk events
  console.log('\n  Test 9: Checking risk events...');
  try {
    const riskEvents = await prisma.riskEvent.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      select: {
        eventType: true,
        severity: true,
        protocol: true,
        timestamp: true,
      },
    });

    console.log(` Total risk events: ${riskEvents.length}`);
    if (riskEvents.length > 0) {
      console.log('\n   Recent risk events:');
      riskEvents.forEach((event, i) => {
        console.log(`      ${i + 1}. ${event.eventType} - ${event.severity}`);
        console.log(`         Protocol: ${event.protocol}`);
        console.log(`         Time: ${event.timestamp.toISOString()}`);
      });
    }
  } catch (error) {
    console.error(' Error checking risk events:', error);
  }

  // Test 10: Database health check
  console.log('\n🏥 Test 10: Database health check...');
  try {
    const dbSize = await prisma.$queryRaw`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as size,
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as tables
    ` as any[];

    console.log(' Database health:');
    console.log(`   Size: ${dbSize[0].size}`);
    console.log(`   Tables: ${dbSize[0].tables}`);
  } catch (error) {
    console.log('  Could not fetch database size (may require permissions)');
  }

  console.log('\n=== Indexer Test Complete ===\n');

  // Summary
  console.log(' Summary:');
  const recordCount = await prisma.yieldRecord.count();
  const protocolCount = await prisma.protocolMetadata.count();
  
  if (recordCount > 0) {
    console.log(` Data indexer is working! ${recordCount} records from ${protocolCount} protocols`);
  } else {
    console.log('  No data indexed yet. Make sure to:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Wait for the first collection cycle (~1-2 minutes)');
    console.log('   3. Run this test again');
  }
  console.log('');
}

// Run tests
testDataIndexer()
  .then(async () => {
    await prisma.$disconnect();
    console.log(' Tests completed successfully');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(' Test suite failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
