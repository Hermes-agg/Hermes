import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import { calculateRiskAdjustedScore } from '../utils/math';
import volatilityOracle from './volatilityOracle';
import marinadeService from '../services/marinade';
import jitoService from '../services/jito';
import marginfiService from '../services/marginfi';
import kaminoService from '../services/kamino';
import orcaService from '../services/orca';

export interface RiskAssessment {
  protocol: string;
  asset: string;
  riskScore: number; // 0-100, higher is better
  safetyTier: string; // 'AAA', 'AA', 'A', 'BBB', 'BB', 'B'
  factors: {
    apyScore: number;
    tvlScore: number;
    volatilityScore: number;
    ilScore: number;
    protocolScore: number;
  };
  risks: string[];
  timestamp: Date;
}

export class RiskEngine {
  private readonly weights = {
    apy: parseFloat(process.env.RISK_WEIGHT_APY || '0.4'),
    tvl: parseFloat(process.env.RISK_WEIGHT_TVL || '0.2'),
    volatility: parseFloat(process.env.RISK_WEIGHT_VOLATILITY || '0.25'),
    il: parseFloat(process.env.RISK_WEIGHT_IL || '0.1'),
    protocol: parseFloat(process.env.RISK_WEIGHT_PROTOCOL || '0.05'),
  };
  
  /**
   * Assess risk for a specific protocol/asset
   */
  async assessRisk(protocol: string, asset: string): Promise<RiskAssessment> {
    try {
      logger.info(`Assessing risk for ${protocol}/${asset}`);
      
      // Get latest yield data
      const yieldRecord = await prisma.yieldRecord.findFirst({
        where: { protocol, asset },
        orderBy: { timestamp: 'desc' },
      });
      
      if (!yieldRecord) {
        throw new Error(`No yield data found for ${protocol}/${asset}`);
      }
      
      // Get volatility metrics
      const volatilityMetrics = await volatilityOracle.getLatestMetrics(protocol, asset);
      
      // Get protocol metadata
      const protocolMetadata = await prisma.protocolMetadata.findUnique({
        where: { protocol },
      });
      
      // Calculate individual factor scores
      const apyScore = this.calculateAPYScore(yieldRecord.apy);
      const tvlScore = this.calculateTVLScore(yieldRecord.tvl);
      const volatilityScore = this.calculateVolatilityScore(
        volatilityMetrics?.volatility30d || 0
      );
      const ilScore = this.calculateILScore(yieldRecord.impermanentLoss || 0);
      const protocolScore = this.calculateProtocolScore(
        protocol,
        protocolMetadata?.healthScore || 100
      );
      
      // Calculate overall risk score
      const riskScore = calculateRiskAdjustedScore(
        yieldRecord.apy,
        yieldRecord.tvl,
        volatilityMetrics?.volatility30d || 0,
        yieldRecord.impermanentLoss || 0,
        100 - protocolScore,
        this.weights
      );
      
      // Determine safety tier
      const safetyTier = this.determineSafetyTier(riskScore);
      
      // Identify specific risks
      const risks = this.identifyRisks(
        yieldRecord,
        volatilityMetrics,
        protocolMetadata
      );
      
      const assessment: RiskAssessment = {
        protocol,
        asset,
        riskScore,
        safetyTier,
        factors: {
          apyScore,
          tvlScore,
          volatilityScore,
          ilScore,
          protocolScore,
        },
        risks,
        timestamp: new Date(),
      };
      
      logger.info(`Risk assessment completed for ${protocol}/${asset}`, {
        riskScore,
        safetyTier,
      });
      
      return assessment;
    } catch (error) {
      logger.error(`Error assessing risk for ${protocol}/${asset}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate APY score (0-100)
   */
  private calculateAPYScore(apy: number): number {
    // Normalize APY to 0-100 scale
    // Assumes APY range of 0-20% (0-0.20)
    return Math.min((apy / 0.20) * 100, 100);
  }
  
  /**
   * Calculate TVL score (0-100)
   */
  private calculateTVLScore(tvl: number): number {
    // Log scale for TVL
    // $1M = 60, $10M = 70, $100M = 80, $1B = 90, $10B = 100
    if (tvl <= 0) return 0;
    const logTVL = Math.log10(tvl);
    return Math.min(Math.max((logTVL - 6) * 20 + 60, 0), 100);
  }
  
  /**
   * Calculate volatility score (0-100, lower volatility is better)
   */
  private calculateVolatilityScore(volatility: number): number {
    // Inverse score: lower volatility = higher score
    // Assumes volatility range of 0-0.5 (0-50%)
    const normalizedVol = Math.min(volatility / 0.5, 1);
    return (1 - normalizedVol) * 100;
  }
  
  /**
   * Calculate impermanent loss score (0-100, lower IL is better)
   */
  private calculateILScore(il: number): number {
    // Inverse score: lower IL = higher score
    // Assumes IL range of 0-0.2 (0-20%)
    const normalizedIL = Math.min(Math.abs(il) / 0.2, 1);
    return (1 - normalizedIL) * 100;
  }
  
  /**
   * Calculate protocol score (0-100)
   */
  private calculateProtocolScore(protocol: string, healthScore: number): number {
    // Base score from health
    let score = healthScore;
    
    // Protocol-specific adjustments
    const protocolBonuses: { [key: string]: number } = {
      marinade: 10, // Well-established
      jito: 10, // Well-audited
      marginfi: 5, // Growing protocol
      kamino: 5, // Newer but solid
      orca: 10, // Established AMM
    };
    
    score += protocolBonuses[protocol] || 0;
    
    return Math.min(score, 100);
  }
  
  /**
   * Determine safety tier based on risk score
   */
  private determineSafetyTier(riskScore: number): string {
    if (riskScore >= 90) return 'AAA';
    if (riskScore >= 80) return 'AA';
    if (riskScore >= 70) return 'A';
    if (riskScore >= 60) return 'BBB';
    if (riskScore >= 50) return 'BB';
    return 'B';
  }
  
  /**
   * Identify specific risks
   */
  private identifyRisks(
    yieldRecord: any,
    volatilityMetrics: any,
    protocolMetadata: any
  ): string[] {
    const risks: string[] = [];
    
    // High volatility risk
    if (volatilityMetrics && volatilityMetrics.volatility30d > 0.3) {
      risks.push('High volatility detected in recent price action');
    }
    
    // Low TVL risk
    if (yieldRecord.tvl < 1000000) {
      risks.push('Low TVL may result in higher slippage');
    }
    
    // Impermanent loss risk
    if (yieldRecord.impermanentLoss && Math.abs(yieldRecord.impermanentLoss) > 0.1) {
      risks.push('Significant impermanent loss risk for LP positions');
    }
    
    // Liquidation risk (for lending protocols)
    if (yieldRecord.liquidationRisk && yieldRecord.liquidationRisk > 0.5) {
      risks.push('High liquidation risk - health factor approaching threshold');
    }
    
    // Protocol health
    if (protocolMetadata && protocolMetadata.healthScore < 80) {
      risks.push('Protocol health score below optimal threshold');
    }
    
    // Blacklisted protocol
    if (protocolMetadata && protocolMetadata.isBlacklisted) {
      risks.push('Protocol is currently blacklisted');
    }
    
    // Consecutive failures
    if (protocolMetadata && protocolMetadata.consecutiveFailures > 3) {
      risks.push('Protocol API experiencing reliability issues');
    }
    
    return risks;
  }
  
  /**
   * Compare risks between multiple protocols
   */
  async compareProtocols(
    protocols: Array<{ protocol: string; asset: string }>
  ): Promise<RiskAssessment[]> {
    try {
      const assessments = await Promise.all(
        protocols.map(({ protocol, asset }) => this.assessRisk(protocol, asset))
      );
      
      // Sort by risk score (descending)
      return assessments.sort((a, b) => b.riskScore - a.riskScore);
    } catch (error) {
      logger.error('Error comparing protocols:', error);
      return [];
    }
  }
  
  /**
   * Check if a protocol meets minimum risk requirements
   */
  async meetsRiskRequirements(
    protocol: string,
    asset: string,
    minRiskScore: number = 60
  ): Promise<boolean> {
    try {
      const assessment = await this.assessRisk(protocol, asset);
      return assessment.riskScore >= minRiskScore;
    } catch (error) {
      logger.error('Error checking risk requirements:', error);
      return false;
    }
  }
  
  /**
   * Get protocol-specific risk calculator
   */
  async getProtocolRiskScore(
    protocol: string,
    data: any
  ): Promise<number> {
    try {
      switch (protocol) {
        case 'marinade':
          return marinadeService.calculateRiskScore(data);
        case 'jito':
          return jitoService.calculateRiskScore(data);
        case 'marginfi':
          return marginfiService.calculateRiskScore(data);
        case 'kamino':
          return kaminoService.calculateRiskScore(data);
        case 'orca':
          return orcaService.calculateRiskScore(data);
        default:
          return 50; // Default medium risk
      }
    } catch (error) {
      logger.error(`Error calculating protocol risk score for ${protocol}:`, error);
      return 50;
    }
  }
  
  /**
   * Detect risk events and log them
   */
  async detectRiskEvents(): Promise<void> {
    try {
      logger.info('Detecting risk events...');
      
      // Get all unique protocol/asset combinations
      const combinations = await prisma.yieldRecord.findMany({
        distinct: ['protocol', 'asset'],
        select: {
          protocol: true,
          asset: true,
        },
      });
      
      for (const { protocol, asset } of combinations) {
        // Check for APY drops
        await this.checkAPYDrop(protocol, asset);
        
        // Check for TVL drops
        await this.checkTVLDrop(protocol, asset);
        
        // Check for volatility spikes
        await volatilityOracle.detectVolatilitySpike(protocol, asset);
      }
      
      logger.info('Risk event detection completed');
    } catch (error) {
      logger.error('Error detecting risk events:', error);
    }
  }
  
  /**
   * Check for significant APY drops
   */
  private async checkAPYDrop(protocol: string, asset: string): Promise<void> {
    const records = await prisma.yieldRecord.findMany({
      where: { protocol, asset },
      orderBy: { timestamp: 'desc' },
      take: 2,
    });
    
    if (records.length < 2) return;
    
    const [current, previous] = records;
    const apyDrop = (previous.apy - current.apy) / previous.apy;
    
    if (apyDrop > 0.2) { // 20% drop
      await prisma.riskEvent.create({
        data: {
          protocol,
          eventType: 'apy_drop',
          severity: apyDrop > 0.5 ? 'high' : 'medium',
          description: `APY dropped by ${(apyDrop * 100).toFixed(1)}% from ${previous.apy.toFixed(2)} to ${current.apy.toFixed(2)}`,
          metrics: {
            previousAPY: previous.apy,
            currentAPY: current.apy,
            dropPercentage: apyDrop,
          },
        },
      });
    }
  }
  
  /**
   * Check for significant TVL drops
   */
  private async checkTVLDrop(protocol: string, asset: string): Promise<void> {
    const records = await prisma.yieldRecord.findMany({
      where: { protocol, asset },
      orderBy: { timestamp: 'desc' },
      take: 2,
    });
    
    if (records.length < 2) return;
    
    const [current, previous] = records;
    const tvlDrop = (previous.tvl - current.tvl) / previous.tvl;
    
    if (tvlDrop > 0.3) { // 30% drop
      await prisma.riskEvent.create({
        data: {
          protocol,
          eventType: 'tvl_drop',
          severity: tvlDrop > 0.5 ? 'critical' : 'high',
          description: `TVL dropped by ${(tvlDrop * 100).toFixed(1)}% from $${(previous.tvl / 1e6).toFixed(2)}M to $${(current.tvl / 1e6).toFixed(2)}M`,
          metrics: {
            previousTVL: previous.tvl,
            currentTVL: current.tvl,
            dropPercentage: tvlDrop,
          },
        },
      });
    }
  }
}

export default new RiskEngine();
