import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from '../utils/logger';

/**
 * DeFiLlama Protocol Data
 */
export interface DeFiLlamaProtocol {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  category: string;
  tvl: number;
  chainTvls: Record<string, number>;
  change_1d?: number;
  change_7d?: number;
  mcap?: number;
}

/**
 * DeFiLlama TVL Response
 */
export interface DeFiLlamaTVL {
  tvl: number;
  date: number;
}

/**
 * Protocol Mapping (Our protocol name -> DeFiLlama slug)
 * Verified slugs from https://api.llama.fi/protocols
 */
const PROTOCOL_MAPPING: Record<string, string> = {
  'marinade': 'marinade-liquid-staking',
  'jito': 'jito-liquid-staking',
  'kamino': 'kamino-lend',
  'marginfi': 'marginfi-lending',
  'orca': 'orca-dex',
  'solend': 'solend',
  'mango': 'mango-markets',
  'port': 'port-finance',
  'jupiter': 'jupiter-exchange',
  'drift': 'drift-protocol',
  'lido': 'lido',
};

export class DeFiLlamaService {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.llama.fi',
      timeout: 15000,
    });

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  /**
   * Get all Solana protocols with TVL data
   */
  async getAllSolanaProtocols(): Promise<DeFiLlamaProtocol[]> {
    try {
      const cached = this.getFromCache('all-protocols');
      if (cached) return cached;

      logger.info('Fetching all protocols from DeFiLlama...');
      const response = await this.client.get('/protocols');

      // Filter for Solana protocols
      const solanaProtocols = response.data
        .filter((p: any) => {
          const chains = p.chains || [];
          return chains.includes('Solana') || p.chain === 'Solana';
        })
        .map((p: any) => ({
          id: p.slug,
          slug: p.slug,
          name: p.name,
          symbol: p.symbol,
          chain: 'Solana',
          category: p.category,
          tvl: p.chainTvls?.Solana || p.tvl || 0,
          chainTvls: p.chainTvls || {},
          change_1d: p.change_1d,
          change_7d: p.change_7d,
          mcap: p.mcap,
        }));

      this.setCache('all-protocols', solanaProtocols);
      logger.info(`Fetched ${solanaProtocols.length} Solana protocols from DeFiLlama`);

      return solanaProtocols;
    } catch (error) {
      logger.error('Error fetching protocols from DeFiLlama:', error);
      return [];
    }
  }

  /**
   * Get TVL for a specific protocol by slug
   */
  async getProtocolTVL(protocolSlug: string): Promise<number> {
    try {
      const cached = this.getFromCache(`tvl-${protocolSlug}`);
      if (cached !== undefined) return cached;

      // Get all protocols and find the one we want
      const protocols = await this.getAllSolanaProtocols();
      const protocol = protocols.find((p: any) => p.slug === protocolSlug);
      
      if (!protocol) {
        logger.warn(`Protocol ${protocolSlug} not found in DeFiLlama`);
        return 0;
      }

      this.setCache(`tvl-${protocolSlug}`, protocol.tvl);
      return protocol.tvl;
    } catch (error) {
      logger.warn(`Failed to fetch TVL for ${protocolSlug}:`, error);
      return 0;
    }
  }

  /**
   * Get historical TVL for a protocol
   */
  async getProtocolTVLHistory(protocolSlug: string): Promise<DeFiLlamaTVL[]> {
    try {
      logger.info(`Fetching TVL history for ${protocolSlug}...`);
      const response = await this.client.get(`/protocol/${protocolSlug}`);

      if (!response.data?.chainTvls?.Solana?.tvl) {
        return [];
      }

      return response.data.chainTvls.Solana.tvl.map((entry: any) => ({
        tvl: entry.totalLiquidityUSD || entry.tvl,
        date: entry.date,
      }));
    } catch (error) {
      logger.warn(`Failed to fetch TVL history for ${protocolSlug}:`, error);
      return [];
    }
  }

  /**
   * Get protocol data by our internal protocol name
   */
  async getProtocolByName(protocolName: string): Promise<DeFiLlamaProtocol | null> {
    try {
      // Find the DeFiLlama slug for our protocol name
      const slug = Object.entries(PROTOCOL_MAPPING).find(
        ([_slug, name]) => name === protocolName
      )?.[0];

      if (!slug) {
        logger.warn(`No DeFiLlama mapping for protocol: ${protocolName}`);
        return null;
      }

      const allProtocols = await this.getAllSolanaProtocols();
      const protocol = allProtocols.find((p) => p.id === slug);

      return protocol || null;
    } catch (error) {
      logger.error(`Error fetching protocol ${protocolName} from DeFiLlama:`, error);
      return null;
    }
  }

  /**
   * Get TVL for our protocol name
   */
  async getTVLForProtocol(protocolName: string): Promise<number> {
    try {
      const slug = PROTOCOL_MAPPING[protocolName];

      if (!slug) {
        logger.warn(`No DeFiLlama mapping for protocol: ${protocolName}`);
        return 0;
      }

      return await this.getProtocolTVL(slug);
    } catch (error) {
      logger.error(`Error fetching TVL for ${protocolName}:`, error);
      return 0;
    }
  }

  /**
   * Get all LST protocols with TVL
   */
  async getAllLSTProtocols(): Promise<DeFiLlamaProtocol[]> {
    const allProtocols = await this.getAllSolanaProtocols();

    // Filter for liquid staking protocols
    return allProtocols.filter((p) =>
      p.category?.toLowerCase().includes('liquid staking') ||
      p.name.toLowerCase().includes('staked') ||
      ['marinade', 'jito', 'lido', 'socean'].includes(p.id)
    );
  }

  /**
   * Get all lending protocols with TVL
   */
  async getAllLendingProtocols(): Promise<DeFiLlamaProtocol[]> {
    const allProtocols = await this.getAllSolanaProtocols();

    return allProtocols.filter((p) =>
      p.category?.toLowerCase().includes('lending') ||
      ['kamino', 'marginfi', 'solend', 'mango-markets', 'port-finance'].includes(p.id)
    );
  }

  /**
   * Get all DEX protocols with TVL
   */
  async getAllDEXProtocols(): Promise<DeFiLlamaProtocol[]> {
    const allProtocols = await this.getAllSolanaProtocols();

    return allProtocols.filter((p) =>
      p.category?.toLowerCase().includes('dex') ||
      ['orca', 'raydium', 'jupiter'].includes(p.id)
    );
  }

  /**
   * Get cache helper
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return undefined;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.data;
  }

  /**
   * Set cache helper
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Add custom protocol mapping
   */
  addProtocolMapping(defiLlamaSlug: string, ourProtocolName: string): void {
    PROTOCOL_MAPPING[defiLlamaSlug] = ourProtocolName;
  }

  /**
   * Get protocol mapping
   */
  getProtocolMapping(): Record<string, string> {
    return { ...PROTOCOL_MAPPING };
  }
}

export default new DeFiLlamaService();
