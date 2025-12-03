import dotenv from 'dotenv';
import { createApp } from './api';
import { logger } from './utils/logger';
import { startYieldCollector } from './workers/yieldCollector';
import { startDPOWorker } from './workers/dpoWorker';
import { yieldRefresher } from './workers/yield-refresher';
import signalMonitor from './workers/signalMonitor';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    logger.info('Starting HERMES backend...');
    
    // Create Express app
    const app = createApp();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Start background workers
    logger.info('Starting background workers...');
    await Promise.all([
      startYieldCollector(),
      startDPOWorker(),
    ]);
    
    // Yield refresher auto-starts on import (every 10 minutes)
    logger.info('Yield refresher status:', yieldRefresher.getStatus());
    
    // Signal monitor auto-starts on import (every 5 minutes)
    logger.info('Signal monitor status:', signalMonitor.getStatus());
    
    logger.info('HERMES backend started successfully');
    logger.info('🚨 Signal Engine activated - monitoring for risks');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start HERMES backend:', error);
    process.exit(1);
  }
}

main();
