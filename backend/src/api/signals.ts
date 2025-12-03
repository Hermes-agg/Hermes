import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { prisma } from '../db/prisma';
import signalEngine, { SignalSeverity } from '../engine/signalEngine';
import signalMonitor from '../workers/signalMonitor';

const router = Router();

/**
 * GET /api/signals
 * Get current active signals
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { protocol, severity, actionable } = req.query;

    // Run signal check
    const signals = await signalEngine.runAllChecks();

    // Filter
    let filtered = signals;
    
    if (protocol) {
      filtered = filtered.filter(s => s.protocol === protocol);
    }
    
    if (severity) {
      filtered = filtered.filter(s => s.severity === severity);
    }
    
    if (actionable === 'true') {
      filtered = filtered.filter(s => s.actionable);
    }

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
      summary: {
        critical: signals.filter(s => s.severity === SignalSeverity.CRITICAL).length,
        high: signals.filter(s => s.severity === SignalSeverity.HIGH).length,
        medium: signals.filter(s => s.severity === SignalSeverity.MEDIUM).length,
        low: signals.filter(s => s.severity === SignalSeverity.LOW).length,
        actionable: signals.filter(s => s.actionable).length,
      },
    });
  } catch (error) {
    logger.error('Error fetching signals:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch signals',
    });
  }
});

/**
 * GET /api/signals/protocol/:protocol
 * Get signals for a specific protocol
 */
router.get('/protocol/:protocol', async (req: Request, res: Response) => {
  try {
    const { protocol } = req.params;
    
    const signals = await signalEngine.getProtocolSignals(protocol);
    
    return res.json({
      success: true,
      protocol,
      count: signals.length,
      data: signals,
    });
  } catch (error) {
    logger.error(`Error fetching signals for ${req.params.protocol}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch protocol signals',
    });
  }
});

/**
 * GET /api/signals/risk-events
 * Get historical risk events from database
 */
router.get('/risk-events', async (req: Request, res: Response) => {
  try {
    const { protocol, severity, resolved, limit = '50' } = req.query;

    const where: any = {};
    
    if (protocol) where.protocol = protocol;
    if (severity) where.severity = severity;
    if (resolved !== undefined) where.resolved = resolved === 'true';

    const events = await prisma.riskEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
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
 * POST /api/signals/risk-events/:id/resolve
 * Mark a risk event as resolved
 */
router.post('/risk-events/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.riskEvent.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    logger.error(`Error resolving risk event ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resolve risk event',
    });
  }
});

/**
 * GET /api/signals/monitor/status
 * Get signal monitor status
 */
router.get('/monitor/status', async (_req: Request, res: Response) => {
  try {
    const status = signalMonitor.getStatus();
    
    return res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Error getting monitor status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get monitor status',
    });
  }
});

/**
 * POST /api/signals/check
 * Force a signal check
 */
router.post('/check', async (_req: Request, res: Response) => {
  try {
    const signals = await signalEngine.runAllChecks();
    
    return res.json({
      success: true,
      count: signals.length,
      data: signals,
      summary: {
        critical: signals.filter(s => s.severity === SignalSeverity.CRITICAL).length,
        high: signals.filter(s => s.severity === SignalSeverity.HIGH).length,
        medium: signals.filter(s => s.severity === SignalSeverity.MEDIUM).length,
        low: signals.filter(s => s.severity === SignalSeverity.LOW).length,
      },
    });
  } catch (error) {
    logger.error('Error running signal check:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run signal check',
    });
  }
});

/**
 * GET /api/signals/actionable
 * Get actionable signals (require portfolio changes)
 */
router.get('/actionable', async (_req: Request, res: Response) => {
  try {
    const signals = await signalEngine.getActionableSignals();
    
    return res.json({
      success: true,
      count: signals.length,
      data: signals,
    });
  } catch (error) {
    logger.error('Error fetching actionable signals:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch actionable signals',
    });
  }
});

export default router;
