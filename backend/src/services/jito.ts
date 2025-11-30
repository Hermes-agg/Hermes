import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { searcher } from 'jito-ts';
import { logger } from '../utils/logger';
import { aprToApy } from '../utils/math';
import defiLlamaService from './defillama';

export interface JitoYieldData {
  protocol: string;
  asset: string;
  apy: number;
  apr: number;
  tvl: number;
  jitosolPrice: number;
  mevRewards: number;
  metadata: {
    baseStakingAPY: number;
    mevAPY: number;
    totalStakers: number;
    jitosolSupply: number;
  };
}

export class JitoService {
  private client: AxiosInstance;
  private readonly baseURL = 'https://kobe.mainnet.jito.network/api/v1';
  private searcherClient: searcher.SearcherClient | null = null;
  
  constructor() {
    // HTTP client for REST API (yield data, stats)
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               error.response?.status === 429;
      },
    });

    // Initialize Jito SDK SearcherClient (for Block Engine features)
    this.initializeSearcherClient();
  }

  /**
   * Initialize Jito SearcherClient for Block Engine features
   */
  private async initializeSearcherClient(): Promise<void> {
    try {
      // Jito Block Engine endpoints
      const blockEngineUrl = process.env.JITO_BLOCK_ENGINE_URL || 'frankfurt.mainnet.block-engine.jito.wtf';
      
      // Create SearcherClient using factory function
      this.searcherClient = searcher.searcherClient(blockEngineUrl);

      logger.info('Jito SearcherClient initialized successfully');
    } catch (error) {
      logger.warn('Failed to initialize Jito SearcherClient:', error);
      // Continue without SDK features - REST API will still work
    }
  }
  
  /**
   * Fetch JitoSOL staking APY with MEV rewards
   */
  async fetchYieldData(): Promise<JitoYieldData> {
    try {
      logger.info('Fetching Jito yield data...');
      
      // Fetch APY and stats from Jito API
      const apyResponse = await this.client.get('/apy');
      const statsResponse = await this.client.get('/program');
      
      // Base staking APY (traditional staking rewards)
      const baseAPR = apyResponse.data.staking_apr || 0.07; // ~7% base
      const baseAPY = aprToApy(baseAPR, 365);
      
      // MEV rewards (Jito's unique value proposition)
      const mevAPY = apyResponse.data.mev_apy || 0.015; // ~1.5% MEV
      
      // Combined APY
      const totalAPY = baseAPY + mevAPY;
      
      // TVL and other stats from API
      const apiTvl = statsResponse.data.tvl || 0;
      const jitosolPrice = statsResponse.data.jitosol_price || 1;
      const jitosolSupply = statsResponse.data.jitosol_supply || 0;
      const totalStakers = statsResponse.data.total_stakers || 0;
      
      // Get REAL TVL from DeFiLlama
      const defiLlamaTVL = await defiLlamaService.getTVLForProtocol('jito');
      const tvl = defiLlamaTVL > 0 ? defiLlamaTVL : apiTvl;
      
      const result: JitoYieldData = {
        protocol: 'jito',
        asset: 'JitoSOL',
        apy: totalAPY,
        apr: baseAPR,
        tvl: tvl,
        jitosolPrice: jitosolPrice,
        mevRewards: mevAPY,
        metadata: {
          baseStakingAPY: baseAPY,
          mevAPY: mevAPY,
          totalStakers: totalStakers,
          jitosolSupply: jitosolSupply,
        },
      };
      
      logger.info('Jito yield data fetched successfully', {
        totalAPY: result.apy,
        mevAPY: mevAPY,
        tvl: result.tvl,
        source: defiLlamaTVL > 0 ? 'DeFiLlama' : 'Jito API',
      });
      
      return result;
    } catch (error) {
      logger.error('Error fetching Jito yield data:', error);
      
      // Fallback: try DeFiLlama TVL even if Jito API failed
      try {
        const llamaTVL = await defiLlamaService.getTVLForProtocol('jito');
        const tvl = llamaTVL > 0 ? llamaTVL : 500000000; // $500M estimate if no llama data
        logger.info('Using Jito fallback with TVL source', { source: llamaTVL > 0 ? 'DeFiLlama' : 'estimate', tvl });
        return {
          protocol: 'jito',
          asset: 'JitoSOL',
          apy: 0.085, // 8.5% estimate
          apr: 0.07,
          tvl,
          jitosolPrice: 1.05,
          mevRewards: 0.015,
          metadata: {
            baseStakingAPY: 0.07,
            mevAPY: 0.015,
            totalStakers: 10000,
            jitosolSupply: 476000000,
          },
        };
      } catch (fallbackErr) {
        logger.warn('DeFiLlama fallback for Jito also failed, using estimates');
        return {
          protocol: 'jito',
          asset: 'JitoSOL',
          apy: 0.085,
          apr: 0.07,
          tvl: 500000000,
          jitosolPrice: 1.05,
          mevRewards: 0.015,
          metadata: {
            baseStakingAPY: 0.07,
            mevAPY: 0.015,
            totalStakers: 10000,
            jitosolSupply: 476000000,
          },
        };
      }
    }
  }
  
  /**
   * Get MEV rewards breakdown
   */
  async getMevRewardsBreakdown(): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
    breakdown: Array<{ date: string; reward: number }>;
  }> {
    try {
      const response = await this.client.get('/mev-rewards');
      const rewards = response.data.rewards || [];
      
      // Calculate aggregated rewards
      const daily = rewards.slice(-1)[0]?.reward || 0;
      const weekly = rewards.slice(-7).reduce((sum: number, r: any) => sum + (r.reward || 0), 0) / 7;
      const monthly = rewards.slice(-30).reduce((sum: number, r: any) => sum + (r.reward || 0), 0) / 30;
      
      return {
        daily,
        weekly,
        monthly,
        breakdown: rewards.slice(-30).map((r: any) => ({
          date: r.date,
          reward: r.reward,
        })),
      };
    } catch (error) {
      logger.warn('Error fetching Jito MEV rewards breakdown:', error);
      return {
        daily: 0.015,
        weekly: 0.015,
        monthly: 0.015,
        breakdown: [],
      };
    }
  }
  
  /**
   * Calculate risk score for Jito
   */
  calculateRiskScore(data: JitoYieldData): number {
    // TVL score
    const tvlScore = Math.min(Math.log10(data.tvl) * 5, 30);
    
    // MEV consistency score (consistent MEV is good)
    const mevScore = Math.min(data.mevRewards * 1000, 20);
    
    // Protocol maturity and audit score
    const maturityScore = 25; // Jito is well-audited
    
    // Decentralization (Jito uses multiple validators)
    const decentralizationScore = 15;
    
    // Price stability (JitoSOL should be close to SOL)
    const priceStability = Math.max(0, 10 - Math.abs(data.jitosolPrice - 1) * 100);
    
    return Math.min(tvlScore + mevScore + maturityScore + decentralizationScore + priceStability, 100);
  }
  
  /**
   * Estimate slippage for staking/unstaking
   */
  async estimateSlippage(amount: number): Promise<number> {
    try {
      // Jito has deep liquidity for staking
      // Slippage is minimal for most operations
      
      const stats = await this.client.get('/program');
      const tvl = stats.data.tvl || 0;
      
      const utilizationRatio = tvl > 0 ? amount / tvl : 0;
      
      // Very low slippage for staking operations
      const slippage = Math.min(utilizationRatio * 0.0001, 0.001); // Max 0.1%
      
      return slippage;
    } catch (error) {
      logger.warn('Error estimating Jito slippage:', error);
      return 0.0005; // Default 0.05%
    }
  }
  
  /**
   * Get fee structure
   */
  getFees(): {
    depositFee: number;
    withdrawalFee: number;
    managementFee: number;
    mevFee: number;
  } {
    return {
      depositFee: 0,
      withdrawalFee: 0.003, // 0.3% unstaking fee
      managementFee: 0.04, // 4% of staking rewards
      mevFee: 0.05, // 5% of MEV rewards
    };
  }
  
  /**
   * Get stake pool info
   */
  async getStakePoolInfo(): Promise<{
    totalStaked: number;
    numberOfValidators: number;
    averageValidatorPerformance: number;
  }> {
    try {
      const response = await this.client.get('/validators');
      const validators = response.data.validators || [];
      
      const totalStaked = validators.reduce(
        (sum: number, v: any) => sum + (v.active_stake || 0),
        0
      );
      
      const avgPerformance = validators.length > 0
        ? validators.reduce((sum: number, v: any) => sum + (v.performance || 0), 0) / validators.length
        : 0;
      
      return {
        totalStaked,
        numberOfValidators: validators.length,
        averageValidatorPerformance: avgPerformance,
      };
    } catch (error) {
      logger.warn('Error fetching Jito stake pool info:', error);
      return {
        totalStaked: 0,
        numberOfValidators: 0,
        averageValidatorPerformance: 0,
      };
    }
  }

  /**
   * Get Jito tip accounts (using SDK)
   * Tip accounts are used for MEV bundle tips
   */
  async getTipAccounts(): Promise<string[]> {
    try {
      if (!this.searcherClient) {
        logger.warn('SearcherClient not initialized, cannot fetch tip accounts');
        return [];
      }

      const result = await this.searcherClient.getTipAccounts();
      
      // Handle Result type
      if ('ok' in result && result.ok && result.value) {
        logger.info(`Fetched ${result.value.length} Jito tip accounts`);
        return result.value;
      }
      
      logger.warn('Failed to fetch tip accounts:', result);
      return [];
    } catch (error) {
      logger.error('Error fetching Jito tip accounts:', error);
      return [];
    }
  }

  /**
   * Get connected leader validators (using SDK)
   * Leaders are validators that can include your bundles
   */
  async getConnectedLeaders(): Promise<any> {
    try {
      if (!this.searcherClient) {
        logger.warn('SearcherClient not initialized, cannot fetch connected leaders');
        return { currentSlot: 0, leaders: [] };
      }

      const result = await this.searcherClient.getConnectedLeaders();
      
      // Handle Result type
      if ('ok' in result && result.ok && result.value) {
        logger.info('Fetched Jito connected leaders');
        return result.value;
      }
      
      logger.warn('Failed to fetch connected leaders:', result);
      return { currentSlot: 0, leaders: [] };
    } catch (error) {
      logger.error('Error fetching Jito connected leaders:', error);
      return { currentSlot: 0, leaders: [] };
    }
  }

  /**
   * Get next scheduled leader (using SDK)
   * Useful for timing bundle submissions
   */
  async getNextScheduledLeader(): Promise<any> {
    try {
      if (!this.searcherClient) {
        logger.warn('SearcherClient not initialized, cannot fetch next leader');
        return null;
      }

      const result = await this.searcherClient.getNextScheduledLeader();
      
      // Handle Result type
      if ('ok' in result && result.ok && result.value) {
        logger.info('Fetched next scheduled Jito leader');
        return result.value;
      }
      
      logger.warn('Failed to fetch next scheduled leader:', result);
      return null;
    } catch (error) {
      logger.error('Error fetching next scheduled leader:', error);
      return null;
    }
  }

  /**
   * Check if SearcherClient is available for MEV features
   */
  isSearcherClientAvailable(): boolean {
    return this.searcherClient !== null;
  }

  /**
   * Get random tip account for MEV bundles
   */
  async getRandomTipAccount(): Promise<string | null> {
    try {
      const tipAccounts = await this.getTipAccounts();
      if (tipAccounts.length === 0) {
        return null;
      }
      const randomIndex = Math.floor(Math.random() * tipAccounts.length);
      return tipAccounts[randomIndex];
    } catch (error) {
      logger.error('Error getting random tip account:', error);
      return null;
    }
  }
}

export default new JitoService();
