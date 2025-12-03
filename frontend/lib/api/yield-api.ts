// lib/api/yield-api.ts

const API_BASE_URL =
  (globalThis as any).__APP_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3000";

function getFullUrl(path: string): string {
  if (
    typeof window !== "undefined" &&
    API_BASE_URL.includes(window.location.origin)
  ) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

const getHeaders = (): HeadersInit => {
  const accessToken = "TOKEN";
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
};

// ————————————————————————
// FULL YIELD ITEM (used by both endpoints)
// ————————————————————————
export interface YieldItem {
  protocol: string;
  asset?: string;
  apy: number;
  apr?: number;
  tvl: number;
  riskScore: number;
  score?: number;
  timestamp?: string;
  realAPY?: number;
  baseAPY?: number;
  slippage?: number;
  gasCost?: number;
  protocolFees?: number;

  // 
  estimatedYearlyReturn?: number;
  estimatedMonthlyReturn?: number;
  estimatedReturn?: number;

  effectivenessScore?: number;
  volatility?: number;
  fees?: any;
  metadata?: any;
}

// ————————————————————————
// BEST ROUTE RESPONSE
// ————————————————————————
export interface BestRouteResponse {
  success?: boolean;
  data: {
    bestRoute: YieldItem & { reason?: string };
    alternativeRoutes: YieldItem[];
    reason?: string;
    confidence?: number;
    timestamp?: string;
    metrics?: {
      totalRoutesEvaluated: number;
      averageAPY: number;
      averageRiskScore: number;
    };
  };
}

export class YieldAPI {
  static async getAllYields(
    params: {
      asset?: string;
      amount?: number;
      limit?: number;
    } = {}
  ) {
    const query = new URLSearchParams();
    if (params.asset) query.append("asset", params.asset);
    if (params.amount) query.append("amount", String(params.amount));
    if (params.limit) query.append("limit", String(params.limit));

    const url = getFullUrl(`/api/yields${query.toString() ? `?${query}` : ""}`);
    const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });

    if (!res.ok) throw new Error("Failed to fetch yields");

    const json = await res.json();
    const list = json?.data ?? json?.yields ?? json ?? [];
    return (Array.isArray(list) ? list : []) as YieldItem[];
  }

  static async getBestRoute(params: {
    asset: string;
    amount: number;
    riskProfile: "low" | "moderate" | "high";
  }) {
    const query = new URLSearchParams({
      asset: params.asset,
      amount: String(params.amount),
      riskProfile: params.riskProfile,
    });

    const url = getFullUrl(`/api/yields/best?${query}`);
    const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Failed to fetch best route");
    }

    const json = await res.json();
    const payload = json?.data ?? json; // ← supports both formats

    return {
      data: {
        bestRoute: payload.bestRoute,
        alternativeRoutes: Array.isArray(payload.alternativeRoutes)
          ? payload.alternativeRoutes
          : [],
        reason: payload.reason,
        confidence: payload.confidence,
        metrics: payload.metrics,
      },
    } as BestRouteResponse;
  }
}
