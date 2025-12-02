/**
 * Protocol Emission Schedules and Incentive Programs
 * Tracks token emissions, vesting, and additional reward programs
 */

export interface EmissionSchedule {
  token: string;              // Emission token symbol (JTO, MNDE, etc.)
  dailyRate: number;          // Tokens emitted per day
  vestingEnd: Date | null;    // When emissions end (null = perpetual)
  totalRemaining: number;     // Total tokens remaining to be emitted
  currentAPRBoost: number;    // Additional APR from emissions (%)
}

export interface IncentiveProgram {
  name: string;
  type: 'points' | 'airdrop' | 'liquidity_mining' | 'referral';
  active: boolean;
  endsAt: Date | null;
  description: string;
  estimatedValue: number;     // Est. additional APY % from this program
  metadata?: any;
}

export interface ProtocolEmissionConfig {
  protocol: string;
  hasEmissions: boolean;
  emissionSchedule: EmissionSchedule | null;
  nextEmissionChange: Date | null;
  incentivePrograms: IncentiveProgram[];
}

/**
 * Protocol Emission & Incentive Registry
 * Updated manually based on protocol announcements
 * Last updated: December 2025
 */
export const PROTOCOL_EMISSIONS: Record<string, ProtocolEmissionConfig> = {
  // Jito - JTO token emissions
  jito: {
    protocol: 'jito',
    hasEmissions: true,
    emissionSchedule: {
      token: 'JTO',
      dailyRate: 150000,        // ~150k JTO per day to stakers
      vestingEnd: new Date('2027-12-01'),
      totalRemaining: 82000000,  // ~82M JTO remaining
      currentAPRBoost: 0.015,    // +1.5% APR from JTO emissions
    },
    nextEmissionChange: new Date('2026-06-01'),
    incentivePrograms: [
      {
        name: 'JTO Staking Rewards',
        type: 'liquidity_mining',
        active: true,
        endsAt: new Date('2027-12-01'),
        description: 'JTO token rewards for jitoSOL holders',
        estimatedValue: 1.5,
      },
    ],
  },

  // Marinade - MNDE token emissions
  marinade: {
    protocol: 'marinade',
    hasEmissions: true,
    emissionSchedule: {
      token: 'MNDE',
      dailyRate: 80000,         // ~80k MNDE per day
      vestingEnd: new Date('2026-10-15'),
      totalRemaining: 29000000,  // ~29M MNDE remaining
      currentAPRBoost: 0.012,    // +1.2% APR from MNDE emissions
    },
    nextEmissionChange: new Date('2026-01-01'),
    incentivePrograms: [
      {
        name: 'MNDE Loyalty Rewards',
        type: 'points',
        active: true,
        endsAt: null,
        description: 'MNDE points for long-term mSOL holders',
        estimatedValue: 1.2,
      },
    ],
  },

  // Kamino - KMNO token emissions
  kamino: {
    protocol: 'kamino',
    hasEmissions: true,
    emissionSchedule: {
      token: 'KMNO',
      dailyRate: 200000,        // ~200k KMNO per day
      vestingEnd: new Date('2028-03-01'),
      totalRemaining: 146000000, // ~146M KMNO remaining
      currentAPRBoost: 0.025,    // +2.5% APR from KMNO emissions
    },
    nextEmissionChange: new Date('2026-03-01'),
    incentivePrograms: [
      {
        name: 'Multiply Rewards',
        type: 'liquidity_mining',
        active: true,
        endsAt: new Date('2028-03-01'),
        description: 'KMNO rewards for Multiply strategy users',
        estimatedValue: 2.5,
      },
      {
        name: 'Points Program',
        type: 'points',
        active: true,
        endsAt: null,
        description: 'Kamino points for future airdrops',
        estimatedValue: 0.5,
      },
    ],
  },

  // MarginFi - No current emissions
  marginfi: {
    protocol: 'marginfi',
    hasEmissions: false,
    emissionSchedule: null,
    nextEmissionChange: null,
    incentivePrograms: [
      {
        name: 'Points Program',
        type: 'points',
        active: true,
        endsAt: null,
        description: 'MarginFi points for potential future airdrop',
        estimatedValue: 0.3,
      },
    ],
  },

  // Drift - No token emissions for dSOL staking
  drift: {
    protocol: 'drift',
    hasEmissions: false,
    emissionSchedule: null,
    nextEmissionChange: null,
    incentivePrograms: [
      {
        name: 'Insurance Fund Staking',
        type: 'liquidity_mining',
        active: true,
        endsAt: null,
        description: 'Share of protocol fees for dSOL stakers',
        estimatedValue: 0.5,
      },
    ],
  },

  // Binance - No emissions (CEX staking)
  binance: {
    protocol: 'binance',
    hasEmissions: false,
    emissionSchedule: null,
    nextEmissionChange: null,
    incentivePrograms: [],
  },

  // Jupiter - No emissions for jupSOL
  jupiter: {
    protocol: 'jupiter',
    hasEmissions: false,
    emissionSchedule: null,
    nextEmissionChange: null,
    incentivePrograms: [],
  },

  // Helius - No emissions
  helius: {
    protocol: 'helius',
    hasEmissions: false,
    emissionSchedule: null,
    nextEmissionChange: null,
    incentivePrograms: [],
  },

  // Meteora - METEO emissions
  meteora: {
    protocol: 'meteora',
    hasEmissions: true,
    emissionSchedule: {
      token: 'METEO',
      dailyRate: 180000,        // ~180k METEO per day
      vestingEnd: new Date('2027-06-01'),
      totalRemaining: 110000000, // ~110M METEO remaining
      currentAPRBoost: 0.08,     // +8% APR from METEO (varies by pool)
    },
    nextEmissionChange: new Date('2026-01-15'),
    incentivePrograms: [
      {
        name: 'Dynamic AMM Rewards',
        type: 'liquidity_mining',
        active: true,
        endsAt: new Date('2027-06-01'),
        description: 'METEO rewards for DLMM pool LPs',
        estimatedValue: 8.0,
      },
    ],
  },

  // Orca - ORCA emissions (reduced)
  orca: {
    protocol: 'orca',
    hasEmissions: true,
    emissionSchedule: {
      token: 'ORCA',
      dailyRate: 50000,         // ~50k ORCA per day (reduced)
      vestingEnd: new Date('2026-08-01'),
      totalRemaining: 14600000,  // ~14.6M ORCA remaining
      currentAPRBoost: 0.03,     // +3% APR from ORCA emissions
    },
    nextEmissionChange: new Date('2026-02-01'),
    incentivePrograms: [
      {
        name: 'Whirlpool Rewards',
        type: 'liquidity_mining',
        active: true,
        endsAt: new Date('2026-08-01'),
        description: 'ORCA rewards for Whirlpool LPs',
        estimatedValue: 3.0,
      },
    ],
  },

  // Raydium - RAY emissions
  raydium: {
    protocol: 'raydium',
    hasEmissions: true,
    emissionSchedule: {
      token: 'RAY',
      dailyRate: 120000,        // ~120k RAY per day
      vestingEnd: null,          // Perpetual with halvings
      totalRemaining: 180000000, // ~180M RAY remaining
      currentAPRBoost: 0.05,     // +5% APR from RAY emissions
    },
    nextEmissionChange: new Date('2026-11-01'), // Next halving
    incentivePrograms: [
      {
        name: 'CLMM Liquidity Rewards',
        type: 'liquidity_mining',
        active: true,
        endsAt: null,
        description: 'RAY rewards for CLMM pool LPs',
        estimatedValue: 5.0,
      },
    ],
  },
};

/**
 * Get emission config for a protocol
 */
export function getProtocolEmissions(protocol: string): ProtocolEmissionConfig | null {
  return PROTOCOL_EMISSIONS[protocol.toLowerCase()] || null;
}

/**
 * Calculate total APR boost from emissions and incentives
 */
export function calculateTotalAPRBoost(protocol: string): number {
  const config = getProtocolEmissions(protocol);
  if (!config) return 0;

  let totalBoost = 0;

  // Add emission APR boost
  if (config.emissionSchedule) {
    totalBoost += config.emissionSchedule.currentAPRBoost;
  }

  // Add active incentive program boosts
  config.incentivePrograms
    .filter(p => p.active)
    .forEach(p => {
      totalBoost += p.estimatedValue / 100; // Convert % to decimal
    });

  return totalBoost;
}

/**
 * Check if a protocol has active emissions
 */
export function hasActiveEmissions(protocol: string): boolean {
  const config = getProtocolEmissions(protocol);
  if (!config || !config.hasEmissions || !config.emissionSchedule) return false;

  const now = new Date();
  if (config.emissionSchedule.vestingEnd && config.emissionSchedule.vestingEnd < now) {
    return false; // Emissions ended
  }

  return config.emissionSchedule.totalRemaining > 0;
}
