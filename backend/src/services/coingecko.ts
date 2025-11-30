import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { logger } from '../utils/logger';

/**
 * CoinGecko LST mapping
 */
const LST_COINGECKO_IDS: Record<string, string> = {
  'binance': 'binance-staked-sol',
  'jupiter': 'jupiter-staked-sol',
  'jito': 'jito-staked-sol',
  'marinade': 'msol',
  'drift': 'drift-staked-sol',
  'helius': 'helius-staked-sol',
  'lido': 'lido-staked-sol',
  'bybit': 'bybit-staked-sol',
};

export interface CoinGeckoLSTData {
  protocol: string;
  price: number;
  marketCap: number;
  priceChange24h?: number;
}

export class CoinGeckoService {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes (CoinGecko rate limit)

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 10000,
    });

    axiosRetry(this.client, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  /**
   * Get LST data by protocol name
   */
  async getLSTData(protocolName: string): Promise<CoinGeckoLSTData | null> {
    const coingeckoId = LST_COINGECKO_IDS[protocolName];
    if (!coingeckoId) {
      return null;
    }

    const cached = this.getFromCache(coingeckoId);
    if (cached) return cached;

    try {
      const response = await this.client.get('/simple/price', {
        params: {
          ids: coingeckoId,
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_change: true,
        },
      });

      const data = response.data[coingeckoId];
      if (!data) return null;

      const result: CoinGeckoLSTData = {
        protocol: protocolName,
        price: data.usd || 0,
        marketCap: data.usd_market_cap || 0,
        priceChange24h: data.usd_24h_change,
      };

      this.setCache(coingeckoId, result);
      return result;
    } catch (error) {
      logger.warn(`Failed to fetch CoinGecko data for ${protocolName}:`, error);
      return null;
    }
  }

  /**
   * Get multiple LSTs at once (more efficient)
   */
  async getMultipleLSTs(protocolNames: string[]): Promise<Map<string, CoinGeckoLSTData>> {
    const results = new Map<string, CoinGeckoLSTData>();
    
    // Filter out protocols we don't have IDs for
    const validProtocols = protocolNames.filter(p => LST_COINGECKO_IDS[p]);
    if (validProtocols.length === 0) return results;

    const coingeckoIds = validProtocols.map(p => LST_COINGECKO_IDS[p]).join(',');

    try {
      const response = await this.client.get('/simple/price', {
        params: {
          ids: coingeckoIds,
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_change: true,
        },
      });

      for (const protocol of validProtocols) {
        const coingeckoId = LST_COINGECKO_IDS[protocol];
        const data = response.data[coingeckoId];
        
        if (data && data.usd_market_cap > 0) {
          results.set(protocol, {
            protocol,
            price: data.usd || 0,
            marketCap: data.usd_market_cap || 0,
            priceChange24h: data.usd_24h_change,
          });
        }
      }

      logger.info(`Fetched CoinGecko data for ${results.size}/${validProtocols.length} LSTs`);
    } catch (error) {
      logger.error('Failed to fetch multiple LSTs from CoinGecko:', error);
    }

    return results;
  }

  /**
   * Get cache helper
   */
  private getFromCache(key: string): CoinGeckoLSTData | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache helper
   */
  private setCache(key: string, data: CoinGeckoLSTData): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default new CoinGeckoService();
