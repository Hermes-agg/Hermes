import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from '../utils/logger';
import lstService from './lst';
import marinadeService from './marinade';
import jitoService from './jito';
import binanceService from './binance';
import jupiterService from './jupiter';
import driftService from './drift';
import heliusService from './helius';
import stablecoinService from './stablecoins';

/**
 * HERMES SMART ROUTER
 * Calculates REAL yield after all costs and finds optimal capital routes
 * Combines Price Aggregation + Yield Aggregation = Capital Routing Engine
 */

export interface RouteStep {
  type: 'swap' | 'deposit' | 'withdraw';
  protocol: string;
  from: string;
  to: string;
  estimatedAmount: number;
  estimatedSlippage: number;
  estimatedFee: number;
  estimatedGas: number;
  estimatedTime: number; // seconds
}

export interface RealYieldCalculation {
  advertised_apy: number;
  real_apy: number;
  
  // Cost breakdown
  costs: {
    slippage: number;           // Entry slippage %
    withdrawal_fees: number;     // Exit fees %
    gas_costs_usd: number;       // Total gas in USD
    protocol_fees: number;       // Protocol/management fees %
    total_cost_percent: number;  // Total % reduction
  };
  
  // Risk factors
  risks: {
    protocol_risk_score: number; // 0-100
    validator_risk_score: number; // 0-100 (for LSTs)
    liquidity_risk: number;      // Low liquidity = higher risk
    smart_contract_risk: number; // Audit status, age, etc.
    combined_risk_score: number; // Weighted average
  };
  
  // Time considerations
  time_factors: {
    lockup_period_days: number;
    apy_decay_rate: number;      // Expected % decrease per month
    expected_apy_30d: number;    // Projected APY in 30 days
    expected_apy_90d: number;    // Projected APY in 90 days
  };
  
  // Transaction reliability
  execution: {
    success_probability: number;  // 0-1
    estimated_confirmation_time: number; // seconds
    network_congestion_factor: number;
  };
}

export interface OptimalRoute {
  route_id: string;
  steps: RouteStep[];
  
  // Yield metrics
  advertised_apy: number;
  real_apy: number;
  net_yield_improvement: number; // vs advertised
  
  // Total costs
  total_entry_cost_percent: number;
  total_exit_cost_percent: number;
  total_gas_usd: number;
  
  // Route quality
  route_score: number; // 0-100, combining yield + risk
  execution_probability: number;
  estimated_total_time: number;
  
  // Yield calculation
  yield_calculation: RealYieldCalculation;
  
  // Comparison
  vs_direct_deposit?: {
    cost_savings_percent: number;
    yield_improvement_percent: number;
  };
}

export interface RouteRequest {
  from_token: string;      // SOL, USDC, etc.
  to_protocol: string;     // marinade, kamino, etc.
  to_asset: string;        // mSOL, USDC, etc.
  amount: number;          // Amount in base units
  user_risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  max_slippage_percent?: number;
  optimize_for?: 'yield' | 'safety' | 'speed';
}

class SmartRouterService {
  private jupiterClient: AxiosInstance;
  private sanctumClient: AxiosInstance;
  
  // Gas estimation (in lamports)
  private readonly BASE_GAS_COST = 0.000005; // SOL per transaction
  private readonly SWAP_GAS_COST = 0.00002;  // SOL for swap
  private readonly DEPOSIT_GAS_COST = 0.00001; // SOL for deposit
  
  // Network congestion multiplier
  private networkCongestionFactor = 1.0;

  constructor() {
    // Jupiter Aggregator API
    this.jupiterClient = axios.create({
      baseURL: 'https://quote-api.jup.ag/v6',
      timeout: 10000,
    });
    
    // Sanctum Router API (for LST swaps)
    this.sanctumClient = axios.create({
      baseURL: 'https://api.sanctum.so',
      timeout: 10000,
    });
    
    axiosRetry(this.jupiterClient, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
    });
    
    axiosRetry(this.sanctumClient, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
    });
    
    logger.info('Smart Router Service initialized');
  }

  /**
   * Calculate REAL yield after all costs
   */
  async calculateRealYield(
    protocol: string,
    asset: string,
    amount: number,
    fromToken: string = 'SOL'
  ): Promise<RealYieldCalculation> {
    try {
      // Get advertised yield from dedicated services first, then fall back to generic
      let advertised_apy = 0;
      let protocolData: any = null;
      
      // Route to dedicated LST service based on protocol
      try {
        switch (protocol.toLowerCase()) {
          case 'marinade':
            protocolData = await marinadeService.fetchYieldData();
            break;
          case 'jito':
            protocolData = await jitoService.fetchYieldData();
            break;
          case 'binance':
            protocolData = await binanceService.fetchYieldData();
            break;
          case 'jupiter':
            protocolData = await jupiterService.fetchYieldData();
            break;
          case 'drift':
            protocolData = await driftService.fetchYieldData();
            break;
          case 'helius':
            protocolData = await heliusService.fetchYieldData();
            break;
          default:
            // Try generic LST service for other LSTs
            try {
              protocolData = await lstService.fetchLSTYield(asset);
            } catch {
              // Try stablecoin services
              const stableYields = await stablecoinService.fetchAllStablecoinYields();
              protocolData = stableYields.find(
                y => y.protocol === protocol && y.asset.toLowerCase().includes(asset.toLowerCase())
              );
            }
            break;
        }
        
        if (!protocolData) {
          throw new Error(`Protocol ${protocol} with asset ${asset} not found`);
        }
        
        advertised_apy = protocolData.apy;
      } catch (error) {
        logger.error(`Failed to fetch protocol data for ${protocol}:`, error);
        throw new Error(`Protocol ${protocol} with asset ${asset} not found`);
      }

      // 1. Calculate slippage costs
      const slippageCost = await this.estimateSlippage(fromToken, asset, amount);
      
      // 2. Get withdrawal fees
      const withdrawalFees = this.getWithdrawalFees(protocol, asset);
      
      // 3. Calculate gas costs
      const gasCostsUSD = await this.estimateGasCosts(fromToken, asset, amount);
      
      // 4. Get protocol fees
      const protocolFees = this.getProtocolFees(protocol, asset);
      
      // Total cost percentage
      const totalCostPercent = slippageCost + withdrawalFees + protocolFees;
      
      // 5. Risk assessment
      const risks = this.assessRisks(protocol, asset, protocolData);
      
      // 6. APY decay prediction
      const apyDecay = this.predictAPYDecay(protocol, asset, advertised_apy);
      
      // 7. Lockup period
      const lockupDays = this.getLockupPeriod(protocol, asset);
      
      // 8. Transaction success probability
      const successProbability = this.estimateSuccessProbability(
        protocol,
        amount,
        protocolData.tvl
      );
      
      // Calculate REAL APY
      // Real APY = Advertised APY - Total Costs (annualized) - Risk Premium
      const annualizedCosts = totalCostPercent; // If holding for 1 year
      const riskPremium = (100 - risks.combined_risk_score) * 0.001; // Higher risk = lower effective yield
      const real_apy = Math.max(0, advertised_apy - annualizedCosts - riskPremium);
      
      return {
        advertised_apy,
        real_apy,
        costs: {
          slippage: slippageCost,
          withdrawal_fees: withdrawalFees,
          gas_costs_usd: gasCostsUSD,
          protocol_fees: protocolFees,
          total_cost_percent: totalCostPercent,
        },
        risks,
        time_factors: {
          lockup_period_days: lockupDays,
          apy_decay_rate: apyDecay.monthly_decay_rate,
          expected_apy_30d: apyDecay.expected_apy_30d,
          expected_apy_90d: apyDecay.expected_apy_90d,
        },
        execution: {
          success_probability: successProbability,
          estimated_confirmation_time: 30 + (this.networkCongestionFactor * 10),
          network_congestion_factor: this.networkCongestionFactor,
        },
      };
    } catch (error) {
      logger.error('Error calculating real yield:', error);
      throw error;
    }
  }

  /**
   * Find optimal route for capital
   * Routes through best DEX path before depositing
   */
  async findOptimalRoute(request: RouteRequest): Promise<OptimalRoute[]> {
    try {
      logger.info(`Finding optimal route: ${request.from_token} -> ${request.to_protocol}`);
      
      const routes: OptimalRoute[] = [];
      
      // Option 1: Direct route (if tokens match)
      if (this.canDirectDeposit(request.from_token, request.to_asset)) {
        const directRoute = await this.buildDirectRoute(request);
        routes.push(directRoute);
      }
      
      // Option 2: Jupiter swap + deposit
      const jupiterRoute = await this.buildJupiterRoute(request);
      if (jupiterRoute) routes.push(jupiterRoute);
      
      // Option 3: Sanctum swap + deposit (for LST routes)
      if (this.isLSTRoute(request.to_asset)) {
        const sanctumRoute = await this.buildSanctumRoute(request);
        if (sanctumRoute) routes.push(sanctumRoute);
      }
      
      // Option 4: Multi-hop routes (SOL -> USDC -> yield)
      const multiHopRoutes = await this.buildMultiHopRoutes(request);
      routes.push(...multiHopRoutes);
      
      // Score and rank routes
      const scoredRoutes = await Promise.all(
        routes.map(route => this.scoreRoute(route, request))
      );
      
      // Sort by route score (best first)
      return scoredRoutes.sort((a, b) => b.route_score - a.route_score);
    } catch (error) {
      logger.error('Error finding optimal route:', error);
      throw error;
    }
  }

  /**
   * Build direct deposit route (no swap needed)
   */
  private async buildDirectRoute(request: RouteRequest): Promise<OptimalRoute> {
    const yieldCalc = await this.calculateRealYield(
      request.to_protocol,
      request.to_asset,
      request.amount,
      request.from_token
    );
    
    const depositGas = this.DEPOSIT_GAS_COST * 200; // SOL price estimate
    
    return {
      route_id: `direct_${Date.now()}`,
      steps: [
        {
          type: 'deposit',
          protocol: request.to_protocol,
          from: request.from_token,
          to: request.to_asset,
          estimatedAmount: request.amount,
          estimatedSlippage: 0,
          estimatedFee: yieldCalc.costs.protocol_fees,
          estimatedGas: depositGas,
          estimatedTime: 30,
        },
      ],
      advertised_apy: yieldCalc.advertised_apy,
      real_apy: yieldCalc.real_apy,
      net_yield_improvement: 0,
      total_entry_cost_percent: yieldCalc.costs.total_cost_percent,
      total_exit_cost_percent: yieldCalc.costs.withdrawal_fees,
      total_gas_usd: depositGas,
      route_score: 0, // Will be calculated later
      execution_probability: yieldCalc.execution.success_probability,
      estimated_total_time: 30,
      yield_calculation: yieldCalc,
    };
  }

  /**
   * Build route using Jupiter Aggregator
   */
  private async buildJupiterRoute(request: RouteRequest): Promise<OptimalRoute | null> {
    try {
      // Get Jupiter quote for swap
      const quote = await this.getJupiterQuote(
        request.from_token,
        request.to_asset,
        request.amount
      );
      
      if (!quote) return null;
      
      const yieldCalc = await this.calculateRealYield(
        request.to_protocol,
        request.to_asset,
        quote.outAmount,
        request.to_asset
      );
      
      const swapGas = this.SWAP_GAS_COST * 200;
      const depositGas = this.DEPOSIT_GAS_COST * 200;
      
      return {
        route_id: `jupiter_${Date.now()}`,
        steps: [
          {
            type: 'swap',
            protocol: 'jupiter',
            from: request.from_token,
            to: request.to_asset,
            estimatedAmount: quote.outAmount,
            estimatedSlippage: quote.slippageBps / 10000,
            estimatedFee: quote.platformFee?.amount || 0,
            estimatedGas: swapGas,
            estimatedTime: 20,
          },
          {
            type: 'deposit',
            protocol: request.to_protocol,
            from: request.to_asset,
            to: request.to_asset,
            estimatedAmount: quote.outAmount,
            estimatedSlippage: 0,
            estimatedFee: yieldCalc.costs.protocol_fees,
            estimatedGas: depositGas,
            estimatedTime: 30,
          },
        ],
        advertised_apy: yieldCalc.advertised_apy,
        real_apy: yieldCalc.real_apy,
        net_yield_improvement: 0,
        total_entry_cost_percent: yieldCalc.costs.total_cost_percent + (quote.slippageBps / 10000),
        total_exit_cost_percent: yieldCalc.costs.withdrawal_fees,
        total_gas_usd: swapGas + depositGas,
        route_score: 0,
        execution_probability: yieldCalc.execution.success_probability * 0.98, // Slightly lower due to swap
        estimated_total_time: 50,
        yield_calculation: yieldCalc,
      };
    } catch (error) {
      logger.warn('Failed to build Jupiter route:', error);
      return null;
    }
  }

  /**
   * Build route using Sanctum (optimized for LST swaps)
   */
  private async buildSanctumRoute(request: RouteRequest): Promise<OptimalRoute | null> {
    try {
      // Sanctum specializes in SOL <-> LST swaps with better rates
      const quote = await this.getSanctumQuote(
        request.from_token,
        request.to_asset,
        request.amount
      );
      
      if (!quote) return null;
      
      const yieldCalc = await this.calculateRealYield(
        request.to_protocol,
        request.to_asset,
        quote.outAmount,
        request.to_asset
      );
      
      const swapGas = this.SWAP_GAS_COST * 200;
      const depositGas = this.DEPOSIT_GAS_COST * 200;
      
      return {
        route_id: `sanctum_${Date.now()}`,
        steps: [
          {
            type: 'swap',
            protocol: 'sanctum',
            from: request.from_token,
            to: request.to_asset,
            estimatedAmount: quote.outAmount,
            estimatedSlippage: quote.priceImpactPct || 0.001,
            estimatedFee: quote.fee || 0,
            estimatedGas: swapGas,
            estimatedTime: 15,
          },
          {
            type: 'deposit',
            protocol: request.to_protocol,
            from: request.to_asset,
            to: request.to_asset,
            estimatedAmount: quote.outAmount,
            estimatedSlippage: 0,
            estimatedFee: yieldCalc.costs.protocol_fees,
            estimatedGas: depositGas,
            estimatedTime: 30,
          },
        ],
        advertised_apy: yieldCalc.advertised_apy,
        real_apy: yieldCalc.real_apy,
        net_yield_improvement: 0,
        total_entry_cost_percent: yieldCalc.costs.total_cost_percent + (quote.priceImpactPct || 0.001),
        total_exit_cost_percent: yieldCalc.costs.withdrawal_fees,
        total_gas_usd: swapGas + depositGas,
        route_score: 0,
        execution_probability: yieldCalc.execution.success_probability * 0.99, // Sanctum is reliable for LSTs
        estimated_total_time: 45,
        yield_calculation: yieldCalc,
      };
    } catch (error) {
      logger.warn('Failed to build Sanctum route:', error);
      return null;
    }
  }

  /**
   * Build multi-hop routes (e.g., SOL -> USDC -> Kamino)
   */
  private async buildMultiHopRoutes(_request: RouteRequest): Promise<OptimalRoute[]> {
    // For now, return empty - can be expanded later
    // This would handle cases like: SOL -> USDC -> high-yield USDC vault
    return [];
  }

  /**
   * Score route based on yield, cost, risk, and user preferences
   */
  private async scoreRoute(
    route: OptimalRoute,
    request: RouteRequest
  ): Promise<OptimalRoute> {
    const { optimize_for = 'yield', user_risk_tolerance } = request;
    
    // Base score from real APY (0-100 scale)
    const yieldScore = Math.min(100, route.real_apy * 1000);
    
    // Cost penalty (lower cost = higher score)
    const costScore = Math.max(0, 100 - (route.total_entry_cost_percent * 100));
    
    // Risk score from calculation
    const riskScore = route.yield_calculation.risks.combined_risk_score;
    
    // Execution reliability
    const reliabilityScore = route.execution_probability * 100;
    
    // Time penalty (faster = better)
    const timeScore = Math.max(0, 100 - (route.estimated_total_time / 10));
    
    // Weighted scoring based on optimization goal
    let finalScore = 0;
    
    if (optimize_for === 'yield') {
      finalScore = (
        yieldScore * 0.5 +
        costScore * 0.2 +
        riskScore * 0.15 +
        reliabilityScore * 0.1 +
        timeScore * 0.05
      );
    } else if (optimize_for === 'safety') {
      finalScore = (
        riskScore * 0.4 +
        reliabilityScore * 0.3 +
        yieldScore * 0.2 +
        costScore * 0.1
      );
    } else { // speed
      finalScore = (
        timeScore * 0.4 +
        reliabilityScore * 0.3 +
        yieldScore * 0.2 +
        costScore * 0.1
      );
    }
    
    // Adjust for risk tolerance
    if (user_risk_tolerance === 'conservative') {
      finalScore = finalScore * 0.7 + riskScore * 0.3;
    } else if (user_risk_tolerance === 'aggressive') {
      finalScore = finalScore * 0.7 + yieldScore * 0.3;
    }
    
    route.route_score = Math.round(finalScore);
    return route;
  }

  /**
   * Estimate slippage for token swap
   */
  private async estimateSlippage(
    from: string,
    to: string,
    _amount: number
  ): Promise<number> {
    // If same token, no slippage
    if (from === to) return 0;
    
    // Estimate based on liquidity
    // For simplicity, using fixed estimates - can be enhanced with real DEX data
    const liquidityPairs: Record<string, number> = {
      'SOL-USDC': 0.001,      // 0.1% slippage
      'SOL-mSOL': 0.0005,     // 0.05% slippage (Sanctum optimized)
      'SOL-JitoSOL': 0.0005,
      'USDC-USDT': 0.0001,    // 0.01% slippage (stable pair)
      'default': 0.003,       // 0.3% default
    };
    
    const pairKey = `${from}-${to}`;
    const reversePairKey = `${to}-${from}`;
    
    return liquidityPairs[pairKey] || liquidityPairs[reversePairKey] || liquidityPairs.default;
  }

  /**
   * Get withdrawal fees for protocol
   */
  private getWithdrawalFees(protocol: string, _asset: string): number {
    const fees: Record<string, number> = {
      'marinade': 0.003,      // 0.3% unstake fee
      'jito': 0.003,
      'kamino': 0.001,        // 0.1% withdrawal
      'marginfi': 0.0005,
      'orca': 0.003,
      'raydium': 0.0025,
      'meteora': 0.003,
      'default': 0.003,
    };
    
    return fees[protocol] || fees.default;
  }

  /**
   * Estimate gas costs in USD
   */
  private async estimateGasCosts(
    from: string,
    to: string,
    _amount: number
  ): Promise<number> {
    const solPrice = 200; // Estimate - should fetch real price
    
    let totalGas = this.BASE_GAS_COST;
    
    // Add swap gas if needed
    if (from !== to) {
      totalGas += this.SWAP_GAS_COST;
    }
    
    // Add deposit gas
    totalGas += this.DEPOSIT_GAS_COST;
    
    // Apply congestion factor
    totalGas *= this.networkCongestionFactor;
    
    return totalGas * solPrice;
  }

  /**
   * Get protocol management/performance fees
   */
  private getProtocolFees(protocol: string, _asset: string): number {
    const fees: Record<string, number> = {
      'marinade': 0.02,       // 2% management fee (annualized)
      'jito': 0.04,           // 4% MEV commission
      'kamino': 0.1,          // 10% performance fee
      'marginfi': 0.0,        // No management fee
      'default': 0.02,
    };
    
    return fees[protocol] || fees.default;
  }

  /**
   * Assess protocol and validator risks
   */
  private assessRisks(protocol: string, _asset: string, data: any): any {
    // Protocol risk based on TVL, age, audit
    let protocolRisk = 70; // Base score
    if (data.tvl > 100000000) protocolRisk += 10; // >$100M
    if (['marinade', 'jito', 'kamino', 'marginfi'].includes(protocol)) {
      protocolRisk += 15; // Well-established protocols
    }
    
    // Validator risk (for LSTs)
    const validatorRisk = data.metadata?.validatorCount > 100 ? 85 : 70;
    
    // Liquidity risk
    const liquidityRisk = data.tvl > 50000000 ? 80 : 60;
    
    // Smart contract risk (based on audit, age)
    const scRisk = ['marinade', 'jito', 'kamino'].includes(protocol) ? 90 : 75;
    
    return {
      protocol_risk_score: protocolRisk,
      validator_risk_score: validatorRisk,
      liquidity_risk: liquidityRisk,
      smart_contract_risk: scRisk,
      combined_risk_score: Math.round(
        (protocolRisk * 0.3 + validatorRisk * 0.25 + liquidityRisk * 0.25 + scRisk * 0.2)
      ),
    };
  }

  /**
   * Predict APY decay over time
   */
  private predictAPYDecay(_protocol: string, _asset: string, currentAPY: number): any {
    // Simple decay model - can be enhanced with ML
    const monthlyDecayRate = 0.02; // 2% per month average
    
    return {
      monthly_decay_rate: monthlyDecayRate,
      expected_apy_30d: currentAPY * (1 - monthlyDecayRate),
      expected_apy_90d: currentAPY * Math.pow(1 - monthlyDecayRate, 3),
    };
  }

  /**
   * Get lockup period in days
   */
  private getLockupPeriod(protocol: string, _asset: string): number {
    const lockups: Record<string, number> = {
      'marinade': 0,          // Instant unstake available
      'jito': 0,              // Instant via Sanctum
      'kamino': 0,            // Flexible withdrawal
      'marginfi': 0,
      'orca': 0,
      'default': 3,           // 3 days average for unstaking
    };
    
    return lockups[protocol] || lockups.default;
  }

  /**
   * Estimate transaction success probability
   */
  private estimateSuccessProbability(
    _protocol: string,
    amount: number,
    protocolTVL: number
  ): number {
    let baseProbability = 0.98; // 98% base success rate
    
    // Reduce if amount is too large relative to TVL
    const amountRatio = amount / protocolTVL;
    if (amountRatio > 0.01) baseProbability -= 0.05; // >1% of TVL
    if (amountRatio > 0.05) baseProbability -= 0.10; // >5% of TVL
    
    // Adjust for network congestion
    baseProbability *= (2 - this.networkCongestionFactor) / 2;
    
    return Math.max(0.7, Math.min(0.99, baseProbability));
  }

  /**
   * Get Jupiter quote
   */
  private async getJupiterQuote(from: string, to: string, amount: number): Promise<any> {
    try {
      // Jupiter API expects mint addresses - simplified for now
      const response = await this.jupiterClient.get('/quote', {
        params: {
          inputMint: from,
          outputMint: to,
          amount: amount,
          slippageBps: 50, // 0.5%
        },
      });
      
      return response.data;
    } catch (error) {
      logger.warn('Jupiter quote failed:', error);
      return null;
    }
  }

  /**
   * Get Sanctum quote (optimized for LST swaps)
   */
  private async getSanctumQuote(from: string, to: string, amount: number): Promise<any> {
    try {
      const response = await this.sanctumClient.get('/v1/swap/quote', {
        params: {
          input: from,
          outputLst: to,
          amount: amount,
        },
      });
      
      return response.data;
    } catch (error) {
      logger.warn('Sanctum quote failed:', error);
      return null;
    }
  }

  /**
   * Helper: Check if direct deposit is possible
   */
  private canDirectDeposit(from: string, to: string): boolean {
    return from === to || 
           (from === 'SOL' && to.includes('SOL')) ||
           (from === 'USDC' && to.includes('USDC'));
  }

  /**
   * Helper: Check if route is LST-related
   */
  private isLSTRoute(asset: string): boolean {
    return asset.toLowerCase().includes('sol') && asset !== 'SOL';
  }
}

export default new SmartRouterService();
