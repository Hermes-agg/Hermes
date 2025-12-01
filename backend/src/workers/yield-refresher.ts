import { logger } from '../utils/logger';
import lstService from '../services/lst';
import stablecoinService from '../services/stablecoins';
import { cache } from '../utils/cache';

/**
 * Background worker to automatically refresh yield data
 * Runs every 10 minutes to keep cache warm
 */
export class YieldRefresher {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private refreshInterval: number;

  constructor(intervalMinutes: number = 10) {
    this.refreshInterval = intervalMinutes * 60 * 1000;
  }

  /**
   * Start the background refresh worker
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Yield refresher already running');
      return;
    }

    logger.info(`Starting yield refresher (interval: ${this.refreshInterval / 60000} minutes)`);
    this.isRunning = true;

    // Run immediately on start
    this.refresh().catch(err => logger.error('Initial refresh failed:', err));

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.refresh().catch(err => logger.error('Scheduled refresh failed:', err));
    }, this.refreshInterval);
  }

  /**
   * Stop the background refresh worker
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Yield refresher stopped');
  }

  /**
   * Manually trigger a refresh
   */
  async refresh(): Promise<void> {
    const startTime = Date.now();
    logger.info('Starting yield data refresh...');

    try {
      // Clear existing cache to force fresh fetch
      cache.delete('lst-yields-all');
      cache.delete('stablecoin-yields-all');

      // Fetch fresh data in parallel
      const [lstResults, stablecoinResults] = await Promise.allSettled([
        lstService.fetchAllLSTYields(),
        stablecoinService.fetchAllStablecoinYields(),
      ]);

      // Log results
      const lstCount = lstResults.status === 'fulfilled' ? lstResults.value.length : 0;
      const stableCount = stablecoinResults.status === 'fulfilled' ? stablecoinResults.value.length : 0;

      const duration = Date.now() - startTime;
      logger.info(`Yield refresh complete in ${duration}ms: ${lstCount} LSTs, ${stableCount} stablecoins`);

      // Log any failures
      if (lstResults.status === 'rejected') {
        logger.error('LST refresh failed:', lstResults.reason);
      }
      if (stablecoinResults.status === 'rejected') {
        logger.error('Stablecoin refresh failed:', stablecoinResults.reason);
      }

      // Emit stats
      this.logStats(lstCount, stableCount);
    } catch (error) {
      logger.error('Yield refresh error:', error);
      throw error;
    }
  }

  /**
   * Log refresh statistics
   */
  private logStats(lstCount: number, stableCount: number): void {
    const cacheStats = cache.stats();
    logger.info('Yield data stats:', {
      lsts: lstCount,
      stablecoins: stableCount,
      totalOpportunities: lstCount + stableCount,
      cacheEntries: cacheStats.active,
    });
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      refreshInterval: this.refreshInterval,
      nextRefresh: this.intervalId ? new Date(Date.now() + this.refreshInterval) : null,
    };
  }
}

// Singleton instance
export const yieldRefresher = new YieldRefresher(10); // 10 minutes

// Auto-start on import
if (process.env.NODE_ENV !== 'test') {
  yieldRefresher.start();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, stopping yield refresher...');
  yieldRefresher.stop();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, stopping yield refresher...');
  yieldRefresher.stop();
});
