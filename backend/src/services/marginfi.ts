import { Connection, Keypair } from '@solana/web3.js';
import { MarginfiClient, getConfig, MarginRequirementType } from '@mrgnlabs/marginfi-client-v2';
import { NodeWallet } from '@mrgnlabs/mrgn-common';
import { logger } from '../utils/logger';
import defiLlamaService from './defillama';

export interface MarginFiYieldData {
  protocol: string;
  asset: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: number;
  totalBorrow: number;
  utilizationRate: number;
  tvl: number;
  liquidationThreshold: number;
  ltv: number;
  metadata: {
    collateralFactor: number;
    reserveFactor: number;
    availableLiquidity: number;
    borrowCap: number;
  };
}

export class MarginFiService {
  private connection: Connection;
  private client: MarginfiClient | null = null;
  private initPromise: Promise<void> | null = null;
  
  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }
  
  /**
   * Initialize the MarginFi client
   * Note: Type assertions are needed due to @solana/web3.js version conflicts
   * between the SDK (1.98.0) and our project (1.98.4)
   */
  private async initialize(): Promise<void> {
    if (this.client) return;
    
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          logger.info('Initializing MarginFi SDK client...');
          
          // Use a dummy keypair for read-only operations
          // Type assertion needed due to @solana/web3.js version mismatch
          const dummyKeypair = Keypair.generate();
          const wallet = new NodeWallet(dummyKeypair as any);
          const config = getConfig('production');
          
          this.client = await MarginfiClient.fetch(
            config,
            wallet as any,
            this.connection as any, // Type assertion for Connection version mismatch
            { readOnly: true }
          );
          
          logger.info('MarginFi SDK client initialized successfully');
        } catch (error) {
          logger.error('Failed to initialize MarginFi SDK client:', error);
          this.initPromise = null;
          throw error;
        }
      })();
    }
    
    await this.initPromise;
  }
  
  /**
   * Fetch lending and borrowing APYs for multiple assets using the SDK
   */
  async fetchYieldData(asset: string = 'SOL'): Promise<MarginFiYieldData> {
    try {
      logger.info(`Fetching MarginFi yield data for ${asset}...`);
      
      await this.initialize();
      if (!this.client) throw new Error('MarginFi client not initialized');
      
      // Get bank by token symbol
      const bank = this.client.getBankByTokenSymbol(asset);
      if (!bank) {
        throw new Error(`Bank not found for asset: ${asset}`);
      }
      
      // Get oracle price
      const oraclePrice = this.client.getOraclePriceByBank(bank.address);
      if (!oraclePrice) {
        throw new Error(`Oracle price not found for ${asset}`);
      }
      
      // Calculate interest rates
      const { lendingRate, borrowingRate } = bank.computeInterestRates();
      
      // Calculate utilization rate
      const utilizationRate = bank.computeUtilizationRate().toNumber();
      
      // Get total quantities
      const totalAssets = bank.getTotalAssetQuantity();
      const totalLiabilities = bank.getTotalLiabilityQuantity();
      
      // Convert to UI amounts (with decimals)
      const decimals = bank.mintDecimals;
      const totalSupply = totalAssets.div(10 ** decimals).toNumber();
      const totalBorrow = totalLiabilities.div(10 ** decimals).toNumber();
      
      // Calculate TVL in USD from SDK (per-asset)
      const sdkTvl = bank.computeTvl(oraclePrice).toNumber();
      
      const tvl = sdkTvl > 0 ? sdkTvl : 0;
      
      // Get weights for liquidation calculations
      const assetWeightMaint = bank.getAssetWeight(
        MarginRequirementType.Maintenance,
        oraclePrice
      ).toNumber();
      const liabilityWeightMaint = bank.getLiabilityWeight(
        MarginRequirementType.Maintenance
      ).toNumber();
      
      // Calculate liquidation threshold (inverse of liability weight)
      const liquidationThreshold = liabilityWeightMaint > 0 ? 1 / liabilityWeightMaint : 0.85;
      
      // Calculate LTV (asset weight)
      const ltv = assetWeightMaint;
      
      // Get remaining capacity
      const { borrowCapacity } = bank.computeRemainingCapacity();
      
      // Calculate available liquidity
      const availableLiquidity = totalSupply - totalBorrow;
      
      const result: MarginFiYieldData = {
        protocol: 'marginfi',
        asset: asset,
        supplyAPY: lendingRate.toNumber(),
        borrowAPY: borrowingRate.toNumber(),
        totalSupply,
        totalBorrow,
        utilizationRate,
        tvl,
        liquidationThreshold,
        ltv,
        metadata: {
          collateralFactor: assetWeightMaint,
          reserveFactor: bank.config.interestRateConfig.protocolIrFee.toNumber(),
          availableLiquidity,
          borrowCap: borrowCapacity.div(10 ** decimals).toNumber(),
        },
      };
      
      logger.info(`MarginFi yield data fetched for ${asset}`, {
        supplyAPY: result.supplyAPY,
        borrowAPY: result.borrowAPY,
        utilizationRate: result.utilizationRate,
        tvl: result.tvl,
        tvlSource: sdkTvl > 0 ? 'SDK' : 'unavailable',
      });
      
      return result;
    } catch (error) {
      logger.error(`Error fetching MarginFi yield data for ${asset}:`, error);
      
      // Fallback: Use per-asset TVL estimates instead of protocol-wide TVL
      // This prevents showing the same TVL for all assets
      const fallback = this.getFallbackData(asset);
      
      // Try to enhance with DeFiLlama protocol TVL, but split it intelligently
      try {
        const llamaTVL = await defiLlamaService.getTVLForProtocol('marginfi');
        if (llamaTVL > 0) {
          // Estimate TVL split based on typical market composition
          const tvlMultipliers: Record<string, number> = {
            'SOL': 0.40,  // ~40% of MarginFi is SOL
            'USDC': 0.35, // ~35% is USDC
            'USDT': 0.10, // ~10% is USDT
            'ETH': 0.08,  // ~8% is ETH
            'BTC': 0.05,  // ~5% is BTC
            'default': 0.02, // ~2% for others
          };
          
          const multiplier = tvlMultipliers[asset] || tvlMultipliers['default'];
          const estimatedAssetTVL = llamaTVL * multiplier;
          
          logger.info(`Using estimated ${asset} TVL: $${(estimatedAssetTVL / 1e6).toFixed(1)}M (${(multiplier * 100).toFixed(0)}% of $${(llamaTVL / 1e6).toFixed(0)}M total)`);
          return { ...fallback, tvl: estimatedAssetTVL };
        }
      } catch (llamaErr) {
        logger.warn('DeFiLlama fallback failed for MarginFi TVL');
      }
      
      // Final fallback to static estimates
      return fallback;
    }
  }
  
  /**
   * Fetch all available markets (banks)
   */
  async getAllMarkets(): Promise<MarginFiYieldData[]> {
    try {
      await this.initialize();
      if (!this.client) return [];
      
      // Get all banks from the MarginFi group
      const banks = Array.from(this.client.banks.values());
      
      const results = await Promise.allSettled(
        banks
          .filter(bank => bank.tokenSymbol) // Only banks with token symbols
          .map(bank => this.fetchYieldData(bank.tokenSymbol!))
      );
      
      return results
        .filter((result): result is PromiseFulfilledResult<MarginFiYieldData> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
    } catch (error) {
      logger.error('Error fetching all MarginFi markets:', error);
      return [];
    }
  }
  
  /**
   * Get lending positions for a wallet
   * Note: Requires the wallet's MarginFi account address, not just wallet address
   */
  async getPositions(walletAddress: string): Promise<{
    supplied: Array<{ asset: string; amount: number; value: number }>;
    borrowed: Array<{ asset: string; amount: number; value: number }>;
    healthFactor: number;
  }> {
    try {
      await this.initialize();
      if (!this.client) throw new Error('MarginFi client not initialized');
      
      // Get all MarginFi accounts for this authority
      const accounts = await this.client.getMarginfiAccountsForAuthority(walletAddress);
      
      if (accounts.length === 0) {
        return {
          supplied: [],
          borrowed: [],
          healthFactor: 0,
        };
      }
      
      // Use the first account (users typically have one)
      const account = accounts[0];
      
      const supplied: Array<{ asset: string; amount: number; value: number }> = [];
      const borrowed: Array<{ asset: string; amount: number; value: number }> = [];
      
      // Process active balances
      for (const balance of account.activeBalances) {
        const bank = this.client.getBankByPk(balance.bankPk);
        if (!bank) continue;
        
        const oraclePrice = this.client.getOraclePriceByBank(bank.address);
        if (!oraclePrice) continue;
        
        const { assets, liabilities } = balance.computeUsdValue(
          bank,
          oraclePrice,
          MarginRequirementType.Equity
        );
        
        const quantities = balance.computeQuantityUi(bank);
        
        if (assets.gt(0)) {
          supplied.push({
            asset: bank.tokenSymbol || bank.mint.toString(),
            amount: quantities.assets.toNumber(),
            value: assets.toNumber(),
          });
        }
        
        if (liabilities.gt(0)) {
          borrowed.push({
            asset: bank.tokenSymbol || bank.mint.toString(),
            amount: quantities.liabilities.toNumber(),
            value: liabilities.toNumber(),
          });
        }
      }
      
      // Calculate health factor using account's method
      const healthFactor = account.computeHealthComponents(MarginRequirementType.Maintenance);
      const healthRatio = healthFactor.assets.gt(0) 
        ? healthFactor.assets.div(healthFactor.liabilities).toNumber()
        : Number.MAX_SAFE_INTEGER;
      
      return {
        supplied,
        borrowed,
        healthFactor: healthRatio,
      };
    } catch (error) {
      logger.error('Error fetching MarginFi positions:', error);
      return {
        supplied: [],
        borrowed: [],
        healthFactor: 0,
      };
    }
  }
  
  /**
   * Calculate risk score for MarginFi
   */
  calculateRiskScore(data: MarginFiYieldData): number {
    // Utilization risk (optimal is ~80%)
    const optimalUtilization = 0.8;
    const utilizationDiff = Math.abs(data.utilizationRate - optimalUtilization);
    const utilizationScore = Math.max(0, 25 - utilizationDiff * 100);
    
    // TVL score
    const tvlScore = Math.min(Math.log10(data.tvl) * 5, 25);
    
    // Liquidation risk (higher threshold is safer)
    const liquidationScore = data.liquidationThreshold * 20;
    
    // Protocol maturity
    const maturityScore = 20;
    
    // Liquidity score (more available liquidity is better)
    const liquidityRatio = data.metadata.availableLiquidity / data.totalSupply;
    const liquidityScore = Math.min(liquidityRatio * 30, 10);
    
    return Math.min(
      utilizationScore + tvlScore + liquidationScore + maturityScore + liquidityScore,
      100
    );
  }
  
  /**
   * Calculate liquidation risk
   */
  calculateLiquidationRisk(
    collateralValue: number,
    borrowValue: number,
    liquidationThreshold: number
  ): number {
    if (borrowValue === 0) return 0;
    
    const healthFactor = (collateralValue * liquidationThreshold) / borrowValue;
    
    // Risk increases as health factor approaches 1
    if (healthFactor > 2) return 0.1; // Very low risk
    if (healthFactor > 1.5) return 0.3; // Low risk
    if (healthFactor > 1.2) return 0.5; // Medium risk
    if (healthFactor > 1.0) return 0.8; // High risk
    return 1.0; // Critical risk (liquidatable)
  }
  
  /**
   * Estimate slippage for deposits/withdrawals
   */
  async estimateSlippage(asset: string, amount: number, isDeposit: boolean): Promise<number> {
    try {
      const data = await this.fetchYieldData(asset);
      
      if (isDeposit) {
        // Deposits have minimal slippage
        return 0.0001; // 0.01%
      } else {
        // Withdrawals depend on available liquidity
        const availableLiquidity = data.metadata.availableLiquidity;
        const utilizationAfterWithdraw = availableLiquidity > amount
          ? (data.totalBorrow / (data.totalSupply - amount))
          : 1;
        
        // High utilization increases slippage
        if (utilizationAfterWithdraw > 0.95) {
          return 0.05; // 5% - very high utilization
        } else if (utilizationAfterWithdraw > 0.9) {
          return 0.02; // 2% - high utilization
        }
        
        return 0.001; // 0.1% - normal
      }
    } catch (error) {
      logger.warn('Error estimating MarginFi slippage:', error);
      return 0.005; // Default 0.5%
    }
  }
  
  /**
   * Get fee structure
   */
  getFees(): {
    depositFee: number;
    withdrawalFee: number;
    borrowFee: number;
    liquidationPenalty: number;
  } {
    return {
      depositFee: 0,
      withdrawalFee: 0,
      borrowFee: 0, // Included in borrow APY
      liquidationPenalty: 0.05, // 5% liquidation penalty
    };
  }
  
  /**
   * Fallback data for when API is unavailable
   */
  private getFallbackData(asset: string): MarginFiYieldData {
    const fallbackData: { [key: string]: Partial<MarginFiYieldData> } = {
      SOL: {
        supplyAPY: 0.035,
        borrowAPY: 0.08,
        totalSupply: 5000000,
        totalBorrow: 3500000,
        tvl: 500000000,
      },
      USDC: {
        supplyAPY: 0.05,
        borrowAPY: 0.12,
        totalSupply: 300000000,
        totalBorrow: 240000000,
        tvl: 300000000,
      },
    };
    
    const defaults = fallbackData[asset] || fallbackData['SOL'];
    
    return {
      protocol: 'marginfi',
      asset: asset,
      supplyAPY: defaults.supplyAPY || 0.03,
      borrowAPY: defaults.borrowAPY || 0.08,
      totalSupply: defaults.totalSupply || 0,
      totalBorrow: defaults.totalBorrow || 0,
      utilizationRate: 0.7,
      tvl: defaults.tvl || 0,
      liquidationThreshold: 0.85,
      ltv: 0.8,
      metadata: {
        collateralFactor: 0.8,
        reserveFactor: 0.15,
        availableLiquidity: (defaults.totalSupply || 0) * 0.3,
        borrowCap: 0,
      },
    };
  }
}

export default new MarginFiService();
