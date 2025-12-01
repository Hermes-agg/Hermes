import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import routerEngine from '../engine/router';
import riskEngine from '../engine/risk';
import volatilityOracle from '../engine/volatilityOracle';
import dpoEngine from '../engine/dpo';
import lstService from '../services/lst';
import marinadeService from '../services/marinade';
import jitoService from '../services/jito';
import stablecoinService from '../services/stablecoins';

const router = Router();

/**
 * GET /api/yields
 * Get all current yields from all protocols
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { protocol, asset, limit = '50' } = req.query;
    
    const where: any = {};
    if (protocol) where.protocol = protocol;
    if (asset) where.asset = asset;
    
    const yields = await prisma.yieldRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      distinct: ['protocol', 'asset'],
    });
    
    return res.json({
      success: true,
      count: yields.length,
      data: yields,
    });
  } catch (error) {
    logger.error('Error fetching yields:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch yields',
    });
  }
});

/**
 * GET /api/yields/best
 * Get best yield opportunities based on criteria
 */
router.get('/best', async (req: Request, res: Response) => {
  try {
    const {
      asset = 'SOL',
      amount = '1000',
      riskProfile = 'moderate',
      minAPY,
      maxRisk,
    } = req.query;
    
    const criteria = {
      amount: parseFloat(amount as string),
      asset: asset as string,
      riskProfile: riskProfile as 'conservative' | 'moderate' | 'aggressive',
      minAPY: minAPY ? parseFloat(minAPY as string) : undefined,
      maxRisk: maxRisk ? parseFloat(maxRisk as string) : undefined,
    };
    
    const result = await routerEngine.findBestRoute(criteria);
    
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error finding best yield:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to find best yield',
    });
  }
});

/**
 * GET /api/yields/protocol/:protocol
 * Get yield data for a specific protocol
 */
router.get('/protocol/:protocol', async (req: Request, res: Response) => {
  try {
    const { protocol } = req.params;
    const { timeframe = '24h' } = req.query;
    
    let since: Date;
    switch (timeframe) {
      case '1h':
        since = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    const yields = await prisma.yieldRecord.findMany({
      where: {
        protocol,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'asc' },
    });
    
    return res.json({
      success: true,
      protocol,
      timeframe,
      count: yields.length,
      data: yields,
    });
  } catch (error) {
    logger.error('Error fetching protocol yields:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch protocol yields',
    });
  }
});

/**
 * POST /api/yields/simulate
 * Simulate a yield route
 */
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { protocol, asset, amount } = req.body;
    
    if (!protocol || !asset || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: protocol, asset, amount',
      });
    }
    
    // Get latest yield data for the protocol
    const yieldRecord = await prisma.yieldRecord.findFirst({
      where: { protocol, asset },
      orderBy: { timestamp: 'desc' },
    });
    
    if (!yieldRecord) {
      return res.status(404).json({
        success: false,
        error: 'Yield data not found for the specified protocol and asset',
      });
    }
    
    // Get risk assessment
    const riskAssessment = await riskEngine.assessRisk(protocol, asset);
    
    // Simulate route
    const simulation = await routerEngine.simulateRoute(
      {
        protocol,
        asset,
        score: 0,
        apy: yieldRecord.apy,
        tvl: yieldRecord.tvl,
        riskScore: riskAssessment.riskScore,
        volatility: yieldRecord.volatility,
        slippage: 0.01,
        fees: { deposit: 0, withdrawal: 0.003 },
        estimatedReturn: 0,
        metadata: yieldRecord.metadata,
      },
      amount
    );
    
    return res.json({
      success: true,
      data: {
        protocol,
        asset,
        amount,
        apy: yieldRecord.apy,
        simulation,
        riskAssessment: {
          riskScore: riskAssessment.riskScore,
          safetyTier: riskAssessment.safetyTier,
          risks: riskAssessment.risks,
        },
      },
    });
  } catch (error) {
    logger.error('Error simulating route:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to simulate route',
    });
  }
});

/**
 * GET /api/yields/compare
 * Compare multiple protocols
 */
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const { protocols, asset = 'SOL' } = req.query;
    
    if (!protocols) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: protocols (comma-separated)',
      });
    }
    
    const protocolList = (protocols as string).split(',').map(p => p.trim());
    
    const comparisons = await Promise.all(
      protocolList.map(async (protocol) => {
        const yieldRecord = await prisma.yieldRecord.findFirst({
          where: { protocol, asset: asset as string },
          orderBy: { timestamp: 'desc' },
        });
        
        if (!yieldRecord) return null;
        
        const riskAssessment = await riskEngine.assessRisk(protocol, asset as string);
        const volatilityMetrics = await volatilityOracle.getLatestMetrics(protocol, asset as string);
        
        return {
          protocol,
          asset,
          apy: yieldRecord.apy,
          tvl: yieldRecord.tvl,
          riskScore: riskAssessment.riskScore,
          safetyTier: riskAssessment.safetyTier,
          volatility: volatilityMetrics?.volatility30d || 0,
          sharpeRatio: volatilityMetrics?.sharpeRatio || 0,
        };
      })
    );
    
    const validComparisons = comparisons.filter(c => c !== null);
    
    return res.json({
      success: true,
      count: validComparisons.length,
      data: validComparisons.sort((a, b) => (b?.riskScore || 0) - (a?.riskScore || 0)),
    });
  } catch (error) {
    logger.error('Error comparing protocols:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to compare protocols',
    });
  }
});

/**
 * GET /api/risk/:protocol/:asset
 * Get risk assessment for a protocol/asset
 */
router.get('/risk/:protocol/:asset', async (req: Request, res: Response) => {
  try {
    const { protocol, asset } = req.params;
    
    const assessment = await riskEngine.assessRisk(protocol, asset);
    
    return res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    logger.error('Error assessing risk:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assess risk',
    });
  }
});

/**
 * GET /api/volatility/:protocol/:asset
 * Get volatility metrics
 */
router.get('/volatility/:protocol/:asset', async (req: Request, res: Response) => {
  try {
    const { protocol, asset } = req.params;
    
    const metrics = await volatilityOracle.getLatestMetrics(protocol, asset);
    
    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Volatility metrics not found',
      });
    }
    
    return res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error fetching volatility metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch volatility metrics',
    });
  }
});

/**
 * GET /api/risk-events
 * Get recent risk events
 */
router.get('/risk-events', async (req: Request, res: Response) => {
  try {
    const { protocol, severity, resolved = 'false', limit = '50' } = req.query;
    
    const where: any = {};
    if (protocol) where.protocol = protocol;
    if (severity) where.severity = severity;
    where.resolved = resolved === 'true';
    
    const events = await prisma.riskEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
    });
    
    return res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    logger.error('Error fetching risk events:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch risk events',
    });
  }
});

/**
 * GET /api/portfolio/:id
 * Get portfolio details
 */
router.get('/portfolio/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        dpoJobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }
    
    return res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    logger.error('Error fetching portfolio:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio',
    });
  }
});

/**
 * POST /api/portfolio/:id/evaluate
 * Evaluate portfolio and get recommendations
 */
router.post('/portfolio/:id/evaluate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const evaluation = await dpoEngine.evaluatePortfolio(id);
    
    return res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    logger.error('Error evaluating portfolio:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate portfolio',
    });
  }
});

/**
 * POST /api/portfolio/:id/execute
 * Execute portfolio rebalancing
 */
router.post('/portfolio/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actions } = req.body;
    
    if (!actions || !Array.isArray(actions)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid actions array',
      });
    }
    
    await dpoEngine.executeActions(id, actions);
    
    return res.json({
      success: true,
      message: `${actions.length} actions scheduled for execution`,
    });
  } catch (error) {
    logger.error('Error executing portfolio actions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to execute portfolio actions',
    });
  }
});

/**
 * GET /api/stats
 * Get overall platform statistics
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const totalProtocols = await prisma.protocolMetadata.count({
      where: { isActive: true },
    });
    
    const totalPortfolios = await prisma.portfolio.count();
    
    const totalTVL = await prisma.yieldRecord.aggregate({
      _sum: { tvl: true },
      where: {
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    });
    
    const avgAPY = await prisma.yieldRecord.aggregate({
      _avg: { apy: true },
      where: {
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    });
    
    const activeRiskEvents = await prisma.riskEvent.count({
      where: {
        resolved: false,
        severity: { in: ['high', 'critical'] },
      },
    });
    
    return res.json({
      success: true,
      data: {
        totalProtocols,
        totalPortfolios,
        totalTVL: totalTVL._sum.tvl || 0,
        averageAPY: avgAPY._avg.apy || 0,
        activeRiskEvents,
      },
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

/**
 * GET /api/lst
 * Get all LST yields
 */
router.get('/lst', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching all LST yields...');
    const lstYields = await lstService.fetchAllLSTYields();
    
    return res.json({
      success: true,
      count: lstYields.length,
      data: lstYields,
    });
  } catch (error) {
    logger.error('Error fetching LST yields:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch LST yields',
    });
  }
});

/**
 * GET /api/lst/supported
 * Get list of supported LST symbols
 */
router.get('/lst/supported', (_req: Request, res: Response) => {
  try {
    const supported = lstService.getSupportedLSTs();
    
    return res.json({
      success: true,
      count: supported.length,
      data: supported,
    });
  } catch (error) {
    logger.error('Error fetching supported LSTs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch supported LSTs',
    });
  }
});

/**
 * GET /api/lst/top/tvl
 * Get top LSTs by TVL
 */
router.get('/lst/top/tvl', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const topLSTs = await lstService.getTopLSTs(parseInt(limit as string));
    
    return res.json({
      success: true,
      count: topLSTs.length,
      data: topLSTs,
    });
  } catch (error) {
    logger.error('Error fetching top LSTs by TVL:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch top LSTs',
    });
  }
});

/**
 * GET /api/lst/top/apy
 * Get top LSTs by APY
 */
router.get('/lst/top/apy', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const topLSTs = await lstService.getBestYieldLSTs(parseInt(limit as string));
    
    return res.json({
      success: true,
      count: topLSTs.length,
      data: topLSTs,
    });
  } catch (error) {
    logger.error('Error fetching top LSTs by APY:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch top LSTs by APY',
    });
  }
});

/**
 * GET /api/lst/:symbol
 * Get specific LST yield data
 */
router.get('/lst/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    const lstYield = await lstService.fetchLSTYield(symbol);
    const riskScore = lstService.calculateRiskScore(lstYield);
    const fees = lstService.getFees(symbol);
    
    return res.json({
      success: true,
      data: {
        ...lstYield,
        riskScore,
        fees,
      },
    });
  } catch (error) {
    logger.error(`Error fetching LST ${req.params.symbol}:`, error);
    return res.status(404).json({
      success: false,
      error: 'LST not found or data unavailable',
    });
  }
});

/**
 * POST /api/lst/compare
 * Compare multiple LSTs
 */
router.post('/lst/compare', async (req: Request, res: Response) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid symbols array',
      });
    }
    
    const comparison = await lstService.compareLSTs(symbols);
    
    return res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    logger.error('Error comparing LSTs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to compare LSTs',
    });
  }
});

/**
 * GET /api/lst/:symbol/slippage
 * Estimate slippage for LST swap
 */
router.get('/lst/:symbol/slippage', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { amount = '1000' } = req.query;
    
    const slippage = await lstService.estimateSlippage(
      symbol,
      parseFloat(amount as string)
    );
    
    return res.json({
      success: true,
      data: {
        symbol,
        amount: parseFloat(amount as string),
        estimatedSlippage: slippage,
        slippagePercent: (slippage * 100).toFixed(2) + '%',
      },
    });
  } catch (error) {
    logger.error(`Error estimating slippage for ${req.params.symbol}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to estimate slippage',
    });
  }
});

/**
 * GET /api/validators/health
 * Read-only summary of validator health for Marinade and Jito
 */
router.get('/validators/health', async (_req: Request, res: Response) => {
  try {
    const [marinade, jito] = await Promise.all([
      marinadeService.getValidatorMetrics().catch((e) => {
        logger.warn('Marinade validator metrics unavailable', e);
        return null;
      }),
      jitoService.getStakePoolInfo().catch((e) => {
        logger.warn('Jito stake pool info unavailable', e);
        return null;
      }),
    ]);

    return res.json({
      success: true,
      data: {
        marinade: marinade
          ? {
              totalValidators: marinade.totalValidators,
              avgScore: marinade.avgScore,
              topValidators: marinade.topValidators,
            }
          : null,
        jito: jito
          ? {
              totalStaked: jito.totalStaked,
              numberOfValidators: jito.numberOfValidators,
              averageValidatorPerformance: jito.averageValidatorPerformance,
            }
          : null,
      },
    });
  } catch (error) {
    logger.error('Error fetching validators health:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch validators health' });
  }
});

/**
 * GET /api/stables
 * Get all stablecoin yields across lending, AMM, and perp protocols
 */
router.get('/stables', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching all stablecoin yields...');
    const stableYields = await stablecoinService.fetchAllStablecoinYields();
    
    return res.json({
      success: true,
      count: stableYields.length,
      data: stableYields,
    });
  } catch (error) {
    logger.error('Error fetching stablecoin yields:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stablecoin yields',
    });
  }
});

/**
 * GET /api/stables/top
 * Get top stablecoin yields by APY
 */
router.get('/stables/top', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const topYields = await stablecoinService.getTopYields(parseInt(limit as string));
    
    return res.json({
      success: true,
      count: topYields.length,
      data: topYields,
    });
  } catch (error) {
    logger.error('Error fetching top stablecoin yields:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch top stablecoin yields',
    });
  }
});

/**
 * GET /api/stables/category/:category
 * Get stablecoin yields by category (lending, lp, perp)
 */
router.get('/stables/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['stablecoin-lending', 'stable-lp', 'stable-perp'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }
    
    const yields = await stablecoinService.getYieldsByCategory(
      category as 'stablecoin-lending' | 'stable-lp' | 'stable-perp'
    );
    
    return res.json({
      success: true,
      category,
      count: yields.length,
      data: yields,
    });
  } catch (error) {
    logger.error(`Error fetching stablecoin yields for category ${req.params.category}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stablecoin yields for category',
    });
  }
});

/**
 * GET /api/stables/protocol/:protocol
 * Get stablecoin yields by protocol
 */
router.get('/stables/protocol/:protocol', async (req: Request, res: Response) => {
  try {
    const { protocol } = req.params;
    const yields = await stablecoinService.getYieldsByProtocol(protocol);
    
    return res.json({
      success: true,
      protocol,
      count: yields.length,
      data: yields,
    });
  } catch (error) {
    logger.error(`Error fetching stablecoin yields for protocol ${req.params.protocol}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stablecoin yields for protocol',
    });
  }
});

/**
 * POST /api/stables/compare
 * Compare stablecoin yields across multiple protocols
 */
router.post('/stables/compare', async (req: Request, res: Response) => {
  try {
    const { protocols } = req.body;
    
    if (!protocols || !Array.isArray(protocols)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid protocols array',
      });
    }
    
    const comparison = await stablecoinService.compareProtocols(protocols);
    
    return res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    logger.error('Error comparing stablecoin protocols:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to compare stablecoin protocols',
    });
  }
});

/**
 * GET /api/hermes-index
 * Unified Hermes Index - Complete yield index across LSTs and Stablecoins
 * Returns comprehensive data for the "Google of Yields"
 */
router.get('/hermes-index', async (req: Request, res: Response) => {
  try {
    logger.info('Fetching complete Hermes Index...');
    
    const { category, minAPY, minRiskScore, sortBy = 'apy' } = req.query;
    
    // Fetch all data in parallel
    const [lstYields, stablecoinYields, validatorHealth, protocolStats] = await Promise.allSettled([
      lstService.fetchAllLSTYields(),
      stablecoinService.fetchAllStablecoinYields(),
      Promise.all([
        marinadeService.getValidatorMetrics().catch(() => null),
        jitoService.getStakePoolInfo().catch(() => null),
      ]),
      prisma.protocolMetadata.findMany({
        where: { isActive: true },
        select: {
          protocol: true,
          healthScore: true,
          hasEmissions: true,
          emissionSchedule: true,
          nextEmissionChange: true,
          incentivePrograms: true,
          auditScore: true,
        },
      }),
    ]);

    // Process LST yields
    const lstData = lstYields.status === 'fulfilled' ? lstYields.value : [];
    const lstWithRisk = lstData.map(lst => ({
      ...lst,
      category: 'LST',
      riskScore: lstService.calculateRiskScore(lst),
      fees: lstService.getFees(lst.symbol),
    }));

    // Process stablecoin yields
    const stableData = stablecoinYields.status === 'fulfilled' ? stablecoinYields.value : [];

    // Combine all yields
    let allYields = [
      ...lstWithRisk.map(lst => ({
        protocol: lst.protocol,
        asset: lst.asset,
        symbol: lst.symbol,
        category: 'LST',
        type: 'staking' as const,
        apy: lst.apy,
        baseAPY: lst.apy,
        rewardAPY: 0,
        tvl: lst.tvl,
        riskScore: lst.riskScore,
        liquidityDepth: lst.tvl,
        validatorCount: lst.metadata.validatorCount,
        fees: lst.fees,
      })),
      ...stableData.map(stable => ({
        protocol: stable.protocol,
        asset: stable.asset,
        symbol: stable.asset,
        category: stable.category,
        type: stable.protocolType,
        apy: stable.apy,
        baseAPY: stable.baseAPY,
        rewardAPY: stable.rewardAPY,
        tvl: stable.tvl,
        riskScore: stable.riskScore,
        liquidityDepth: stable.liquidityDepth,
        utilizationRate: stable.utilizationRate,
        fundingRate: stable.fundingRate,
        fees: stable.metadata.fees,
        emissions: stable.metadata.emissions,
      })),
    ];

    // Apply filters
    if (category) {
      const cats = (category as string).split(',');
      allYields = allYields.filter(y => cats.includes(y.category));
    }
    if (minAPY) {
      allYields = allYields.filter(y => y.apy >= parseFloat(minAPY as string));
    }
    if (minRiskScore) {
      allYields = allYields.filter(y => y.riskScore >= parseFloat(minRiskScore as string));
    }

    // Sort
    if (sortBy === 'apy') {
      allYields.sort((a, b) => b.apy - a.apy);
    } else if (sortBy === 'tvl') {
      allYields.sort((a, b) => b.tvl - a.tvl);
    } else if (sortBy === 'risk') {
      allYields.sort((a, b) => b.riskScore - a.riskScore);
    }

    // Calculate aggregate metrics
    const aggregateMetrics = {
      totalProtocols: new Set(allYields.map(y => y.protocol)).size,
      totalTVL: allYields.reduce((sum, y) => sum + y.tvl, 0),
      averageAPY: allYields.length > 0 
        ? allYields.reduce((sum, y) => sum + y.apy, 0) / allYields.length 
        : 0,
      averageRiskScore: allYields.length > 0
        ? allYields.reduce((sum, y) => sum + y.riskScore, 0) / allYields.length
        : 0,
      highestAPY: allYields.length > 0 
        ? Math.max(...allYields.map(y => y.apy))
        : 0,
      safestProtocol: allYields.length > 0
        ? allYields.reduce((best, y) => y.riskScore > best.riskScore ? y : best).protocol
        : null,
      categories: {
        LST: allYields.filter(y => y.category === 'LST').length,
        lending: allYields.filter(y => y.category === 'stablecoin-lending').length,
        stableLP: allYields.filter(y => y.category === 'stable-lp').length,
        perps: allYields.filter(y => y.category === 'stable-perp').length,
      },
    };

    // Protocol metadata with emissions
    const protocolMetadata = protocolStats.status === 'fulfilled' ? protocolStats.value : [];
    const emissionData = protocolMetadata
      .filter(p => p.hasEmissions)
      .map(p => ({
        protocol: p.protocol,
        healthScore: p.healthScore,
        auditScore: p.auditScore,
        emissionSchedule: p.emissionSchedule,
        nextEmissionChange: p.nextEmissionChange,
        incentivePrograms: p.incentivePrograms,
      }));

    // Validator health data
    const [marinade, jito] = validatorHealth.status === 'fulfilled' ? validatorHealth.value : [null, null];
    const validatorMetrics = {
      marinade: marinade ? {
        totalValidators: marinade.totalValidators,
        avgScore: marinade.avgScore,
        topValidators: marinade.topValidators.slice(0, 5),
      } : null,
      jito: jito ? {
        totalStaked: jito.totalStaked,
        numberOfValidators: jito.numberOfValidators,
        averageValidatorPerformance: jito.averageValidatorPerformance,
      } : null,
    };

    // Top opportunities
    const topByAPY = [...allYields]
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 5)
      .map(y => ({
        protocol: y.protocol,
        asset: y.asset,
        category: y.category,
        apy: y.apy,
        riskScore: y.riskScore,
      }));

    const topByRiskAdjusted = [...allYields]
      .sort((a, b) => (b.apy * b.riskScore) - (a.apy * a.riskScore))
      .slice(0, 5)
      .map(y => ({
        protocol: y.protocol,
        asset: y.asset,
        category: y.category,
        apy: y.apy,
        riskScore: y.riskScore,
        riskAdjustedScore: y.apy * y.riskScore,
      }));

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      index: {
        name: 'HERMES INDEX',
        description: 'Comprehensive yield aggregator for Solana LSTs and Stablecoins',
        version: '1.0',
      },
      metrics: aggregateMetrics,
      yields: allYields,
      topOpportunities: {
        highestAPY: topByAPY,
        bestRiskAdjusted: topByRiskAdjusted,
      },
      validatorHealth: validatorMetrics,
      emissionsAndIncentives: emissionData,
      filters: {
        applied: {
          category: category || 'all',
          minAPY: minAPY ? parseFloat(minAPY as string) : null,
          minRiskScore: minRiskScore ? parseFloat(minRiskScore as string) : null,
          sortBy: sortBy as string,
        },
        available: {
          categories: ['LST', 'stablecoin-lending', 'stable-lp', 'stable-perp'],
          sortOptions: ['apy', 'tvl', 'risk'],
        },
      },
    });

    logger.info(`Hermes Index returned ${allYields.length} yield opportunities`);
  } catch (error) {
    logger.error('Error fetching Hermes Index:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Hermes Index',
    });
  }
});

export default router;
