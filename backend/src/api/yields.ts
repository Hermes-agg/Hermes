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
    
    res.json({
      success: true,
      count: yields.length,
      data: yields,
    });
  } catch (error) {
    logger.error('Error fetching yields:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error finding best yield:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      protocol,
      timeframe,
      count: yields.length,
      data: yields,
    });
  } catch (error) {
    logger.error('Error fetching protocol yields:', error);
    res.status(500).json({
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
    
    res.json({
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
    res.status(500).json({
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
    
    res.json({
      success: true,
      count: validComparisons.length,
      data: validComparisons.sort((a, b) => (b?.riskScore || 0) - (a?.riskScore || 0)),
    });
  } catch (error) {
    logger.error('Error comparing protocols:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    logger.error('Error assessing risk:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error fetching volatility metrics:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    logger.error('Error fetching risk events:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    logger.error('Error fetching portfolio:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    logger.error('Error evaluating portfolio:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      message: `${actions.length} actions scheduled for execution`,
    });
  } catch (error) {
    logger.error('Error executing portfolio actions:', error);
    res.status(500).json({
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
    
    res.json({
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
    res.status(500).json({
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
    
    res.json({
      success: true,
      count: lstYields.length,
      data: lstYields,
    });
  } catch (error) {
    logger.error('Error fetching LST yields:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      count: supported.length,
      data: supported,
    });
  } catch (error) {
    logger.error('Error fetching supported LSTs:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      count: topLSTs.length,
      data: topLSTs,
    });
  } catch (error) {
    logger.error('Error fetching top LSTs by TVL:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      count: topLSTs.length,
      data: topLSTs,
    });
  } catch (error) {
    logger.error('Error fetching top LSTs by APY:', error);
    res.status(500).json({
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
    
    res.json({
      success: true,
      data: {
        ...lstYield,
        riskScore,
        fees,
      },
    });
  } catch (error) {
    logger.error(`Error fetching LST ${req.params.symbol}:`, error);
    res.status(404).json({
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
    
    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    logger.error('Error comparing LSTs:', error);
    res.status(500).json({
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
    
    res.json({
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
    res.status(500).json({
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

    res.json({
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
    res.status(500).json({ success: false, error: 'Failed to fetch validators health' });
  }
});

export default router;
