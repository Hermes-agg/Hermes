import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { NativeStakingConfig, NativeStakingSDK } from '@marinade.finance/native-staking-sdk';
import { logger } from '../utils/logger';
import BN from 'bn.js';

export interface MarinadeYieldData {
  protocol: string;
  asset: string;
  apy: number;
  apr: number;
  tvl: number;
  msolPrice: number;
  validatorScore: number;
  stakeAccounts: number;
  metadata: {
    avgValidatorScore: number;
    msolSupply: number;
    totalStaked: number;
    mevRewards: number;
  };
}

export class MarinadeService {
  private client: AxiosInstance;
  private validatorsClient: AxiosInstance;
  private readonly baseURL = 'https://api.marinade.finance';
  private readonly validatorsAPIURL = 'https://validators-api.marinade.finance';
  private connection: Connection;
  private nativeStakingSDK: NativeStakingSDK | null = null;
  
  constructor() {
    // HTTP client for REST API (yield data, stats)
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Configure retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               error.response?.status === 429;
      },
    });
    
    // HTTP client for Validators API (separate domain)
    this.validatorsClient = axios.create({
      baseURL: this.validatorsAPIURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Configure retry logic for validators client
    axiosRetry(this.validatorsClient, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               error.response?.status === 429;
      },
    });

    // Solana connection
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    // Initialize Native Staking SDK
    this.initializeNativeStakingSDK();
  }

  /**
   * Initialize Marinade Native Staking SDK
   */
  private initializeNativeStakingSDK(): void {
    try {
      const config = new NativeStakingConfig({ connection: this.connection });
      this.nativeStakingSDK = new NativeStakingSDK(config);
      logger.info('Marinade Native Staking SDK initialized successfully');
    } catch (error) {
      logger.warn('Failed to initialize Marinade Native Staking SDK:', error);
      // Continue without SDK features - REST API will still work
    }
  }
  
  /**
   * Fetch mSOL staking APY and TVL from official Marinade API
   */
  async fetchYieldData(): Promise<MarinadeYieldData> {
    try {
      logger.info('Fetching Marinade yield data from official API...');
      
      // Use current timestamp for both requests
      const currentTime = new Date().toISOString();
      
      // Fetch TVL from Marinade API with timestamp
      const tlvResponse = await this.client.get('/tlv', {
        params: { time: currentTime }
      });
      const tvl = tlvResponse.data.total_usd;
      
      // Fetch 7-day APY from Marinade API with timestamp
      const apyResponse = await this.client.get('/msol/apy/7d', {
        params: { time: currentTime }
      });
      const apy = apyResponse.data.value;
      
      // Extract additional metadata from TVL response
      const stakedSol = tlvResponse.data.staked_sol || 0;
      const totalSol = tlvResponse.data.total_sol || 0;
      
      // Calculate mSOL price from response data
      const msolPrice = stakedSol > 0 ? totalSol / stakedSol : 1;
      
      const result: MarinadeYieldData = {
        protocol: 'marinade',
        asset: 'mSOL',
        apy: apy,
        apr: apy * 0.95, // Approximate APR from APY
        tvl: tvl,
        msolPrice: msolPrice,
        validatorScore: 85,
        stakeAccounts: 0,
        metadata: {
          avgValidatorScore: 85,
          msolSupply: 0,
          totalStaked: stakedSol,
          mevRewards: 0,
        },
      };
      
      logger.info('Marinade yield data fetched successfully', {
        apy: result.apy,
        tvl: result.tvl,
        timestamp: currentTime,
      });
      
      return result;
    } catch (error) {
      logger.error('Error fetching Marinade yield data:', error);
      throw new Error('Failed to fetch Marinade data from official API');
    }
  }
  
  /**
   * Get validator quality metrics from Marinade's Validators API
   */
  async getValidatorMetrics(): Promise<{
    totalValidators: number;
    avgScore: number;
    topValidators: Array<{ address: string; score: number }>;
  }> {
    try {
      const response = await this.validatorsClient.get('/validators/scores');
      const scores = response.data.scores || [];
      
      if (scores.length === 0) {
        logger.warn('No validator scores returned from Marinade API');
        return {
          totalValidators: 0,
          avgScore: 0,
          topValidators: [],
        };
      }
      
      // Calculate average score
      const avgScore = scores.reduce((sum: number, v: any) => sum + (v.score || 0), 0) / scores.length;
      
      // Get top 10 validators by score
      const topValidators = scores
        .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
        .slice(0, 10)
        .map((v: any) => ({
          address: v.vote_account,
          score: Math.round(v.score * 100), // Convert to 0-100 scale
        }));
      
      logger.info(`Marinade validator metrics: ${scores.length} validators, avg score: ${(avgScore * 100).toFixed(2)}`);
      
      return {
        totalValidators: scores.length,
        avgScore: Math.round(avgScore * 100), // Convert to 0-100 scale
        topValidators: topValidators,
      };
    } catch (error) {
      logger.error('Error fetching Marinade validator metrics:', error);
      throw error;
    }
  }
  
  /**
   * Calculate risk score for Marinade
   */
  calculateRiskScore(data: MarinadeYieldData): number {
    // Base score from validator quality
    const validatorScore = Math.min(data.validatorScore * 10, 30);
    
    // TVL score (higher is better)
    const tvlScore = Math.min(Math.log10(data.tvl) * 5, 30);
    
    // Decentralization score (more validators is better)
    const decentralizationScore = Math.min(data.stakeAccounts / 10, 20);
    
    // Protocol maturity bonus (Marinade is well-established)
    const maturityScore = 20;
    
    return Math.min(validatorScore + tvlScore + decentralizationScore + maturityScore, 100);
  }
  
  /**
   * Estimate slippage for deposits
   */
  async estimateSlippage(amount: number): Promise<number> {
    try {
      // Marinade uses liquidity pools for instant unstaking
      // Slippage is minimal for staking, but can be significant for unstaking
      
      const stats = await this.client.get('/v1/stats');
      const liquidityPool = stats.data.liquidity_pool || { available: 0, target: 0 };
      
      // Calculate slippage based on pool depth
      const poolDepth = liquidityPool.available || 0;
      const utilizationRatio = poolDepth > 0 ? amount / poolDepth : 1;
      
      // Slippage increases quadratically with utilization
      const slippage = Math.min(utilizationRatio * utilizationRatio * 0.01, 0.05); // Max 5%
      
      return slippage;
    } catch (error) {
      logger.warn('Error estimating Marinade slippage:', error);
      return 0.001; // Default 0.1%
    }
  }
  
  /**
   * Get fee structure
   */
  getFees(): {
    depositFee: number;
    withdrawalFee: number;
    managementFee: number;
    nativeUnstakeFee: number;
  } {
    return {
      depositFee: 0, // No deposit fee
      withdrawalFee: 0.003, // 0.3% for instant unstaking (liquid staking)
      managementFee: 0.02, // 2% of rewards
      nativeUnstakeFee: 0.000001, // 0.001 SOL for native unstake preparation
    };
  }

  // ============================================
  // Native Staking SDK Methods
  // ============================================

  /**
   * Build instructions to create and authorize a new stake account
   * @param userPublicKey - User's wallet address
   * @param amountLamports - Amount to stake in lamports (1 SOL = 1_000_000_000 lamports)
   * @returns Instructions and stake account keypair
   */
  buildCreateAuthorizedStakeInstructions(
    userPublicKey: PublicKey,
    amountLamports: BN | number
  ): {
    createAuthorizedStake: any[];
    stakeKeypair: Keypair;
  } {
    if (!this.nativeStakingSDK) {
      throw new Error('Native Staking SDK not initialized');
    }

    const amount = typeof amountLamports === 'number' ? new BN(amountLamports) : amountLamports;
    return this.nativeStakingSDK.buildCreateAuthorizedStakeInstructions(userPublicKey, amount);
  }

  /**
   * Build instructions to migrate existing stake accounts to Marinade Native
   * @param userPublicKey - User's wallet address
   * @param stakeAccounts - Array of stake account addresses to migrate
   * @returns Transaction instructions
   */
  buildAuthorizeInstructions(
    userPublicKey: PublicKey,
    stakeAccounts: PublicKey[]
  ): any[] {
    if (!this.nativeStakingSDK) {
      throw new Error('Native Staking SDK not initialized');
    }

    return this.nativeStakingSDK.buildAuthorizeInstructions(userPublicKey, stakeAccounts);
  }

  /**
   * Build referral instructions for partners
   * @param partnerReferralPubkey - Partner's referral address
   * @returns Referral instructions
   */
  buildReferralInstructions(partnerReferralPubkey: PublicKey): { referralInstructions: any[] } {
    if (!this.nativeStakingSDK) {
      throw new Error('Native Staking SDK not initialized');
    }

    return this.nativeStakingSDK.buildReferralInstructions(partnerReferralPubkey);
  }

  /**
   * Prepare stake accounts for unstaking (revoke)
   * @param userPublicKey - User's wallet address
   * @param amountLamports - Amount to unstake (null for all)
   * @returns Payment instructions and callback
   */
  async initPrepareForRevoke(
    userPublicKey: PublicKey,
    amountLamports: BN | number | null
  ): Promise<{
    payFees: any[];
    onPaid: (signature: string) => Promise<void>;
  }> {
    if (!this.nativeStakingSDK) {
      throw new Error('Native Staking SDK not initialized');
    }

    const amount: BN | undefined =
      amountLamports === null
        ? undefined
        : typeof amountLamports === 'number'
          ? new BN(amountLamports)
          : amountLamports;

    return await this.nativeStakingSDK.initPrepareForRevoke(userPublicKey, amount);
  }

  /**
   * Get prepare for revoke cost (in lamports)
   * Default is 0.001 SOL (1000 lamports)
   */
  getPrepareForRevokeCost(): number {
    return 1000; // 0.000001 SOL
  }

  /**
   * Fetch user's stake accounts in Marinade Native Staking
   * @param userPublicKey - User's wallet address
   * @returns Stake account information
   */
  async getStakeAccounts(userPublicKey: PublicKey): Promise<any> {
    if (!this.nativeStakingSDK) {
      throw new Error('Native Staking SDK not initialized');
    }

    try {
      const accounts = await this.nativeStakingSDK.getStakeAccounts(userPublicKey);
      logger.info(`Fetched stake accounts for ${userPublicKey.toBase58()}`);
      return accounts;
    } catch (error) {
      logger.error('Error fetching stake accounts:', error);
      throw error;
    }
  }

  /**
   * Fetch rewards for user's stake accounts
   * @param userPublicKey - User's wallet address
   * @returns Reward information including APY
   */
  async fetchRewards(userPublicKey: PublicKey): Promise<any> {
    if (!this.nativeStakingSDK) {
      throw new Error('Native Staking SDK not initialized');
    }

    try {
      const rewards = await this.nativeStakingSDK.fetchRewards(userPublicKey);
      logger.info(`Fetched rewards for ${userPublicKey.toBase58()}`);
      return rewards;
    } catch (error) {
      logger.error('Error fetching rewards:', error);
      throw error;
    }
  }

  /**
   * Check if Native Staking SDK is available
   */
  isNativeStakingAvailable(): boolean {
    return this.nativeStakingSDK !== null;
  }

  /**
   * Get Marinade Native Staking authorities
   * These are the on-chain PDAs that manage native staking
   */
  getNativeStakingAuthorities(): {
    stakeAuthority: string;
    unstakeAuthority: string;
  } {
    return {
      stakeAuthority: 'stWirqFCf2Uts1JBL1Jsd3r6VBWhgnpdPxCTe1MFjrq',
      unstakeAuthority: 'ex9CfkBZZd6Nv9XdnoDmmB45ymbu4arXVk7g5pWnt3N',
    };
  }
}

export default new MarinadeService();
