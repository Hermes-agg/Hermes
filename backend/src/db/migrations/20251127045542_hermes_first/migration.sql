-- CreateTable
CREATE TABLE "yield_records" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "pool" TEXT,
    "apy" DOUBLE PRECISION NOT NULL,
    "apr" DOUBLE PRECISION,
    "tvl" DOUBLE PRECISION NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "volatility" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "liquidationRisk" DOUBLE PRECISION,
    "impermanentLoss" DOUBLE PRECISION,

    CONSTRAINT "yield_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "allocations" JSONB NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskProfile" TEXT NOT NULL,
    "lastRebalance" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "initialValue" DOUBLE PRECISION,
    "currentYield" DOUBLE PRECISION,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dpo_jobs" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromProtocol" TEXT,
    "toProtocol" TEXT,
    "amount" DOUBLE PRECISION,
    "reason" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "txSignature" TEXT,

    CONSTRAINT "dpo_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_metadata" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "healthScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "lastSuccessfulFetch" TIMESTAMP(3),
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "auditScore" DOUBLE PRECISION,
    "tvlRank" INTEGER,
    "ageInDays" INTEGER,
    "apiEndpoint" TEXT,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "txSignature" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "blockTime" TIMESTAMP(3),
    "fee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volatility_snapshots" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "volatility" DOUBLE PRECISION NOT NULL,
    "sharpeRatio" DOUBLE PRECISION,
    "maxDrawdown" DOUBLE PRECISION,
    "timeWindow" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volatility_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_events" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metrics" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "risk_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "yield_records_protocol_asset_timestamp_idx" ON "yield_records"("protocol", "asset", "timestamp");

-- CreateIndex
CREATE INDEX "yield_records_timestamp_idx" ON "yield_records"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_userId_key" ON "portfolios"("userId");

-- CreateIndex
CREATE INDEX "portfolios_userId_idx" ON "portfolios"("userId");

-- CreateIndex
CREATE INDEX "portfolios_walletAddress_idx" ON "portfolios"("walletAddress");

-- CreateIndex
CREATE INDEX "dpo_jobs_portfolioId_status_idx" ON "dpo_jobs"("portfolioId", "status");

-- CreateIndex
CREATE INDEX "dpo_jobs_status_createdAt_idx" ON "dpo_jobs"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "protocol_metadata_protocol_key" ON "protocol_metadata"("protocol");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_txSignature_key" ON "transactions"("txSignature");

-- CreateIndex
CREATE INDEX "transactions_portfolioId_createdAt_idx" ON "transactions"("portfolioId", "createdAt");

-- CreateIndex
CREATE INDEX "transactions_txSignature_idx" ON "transactions"("txSignature");

-- CreateIndex
CREATE INDEX "volatility_snapshots_protocol_asset_timeWindow_timestamp_idx" ON "volatility_snapshots"("protocol", "asset", "timeWindow", "timestamp");

-- CreateIndex
CREATE INDEX "risk_events_protocol_timestamp_idx" ON "risk_events"("protocol", "timestamp");

-- CreateIndex
CREATE INDEX "risk_events_severity_resolved_idx" ON "risk_events"("severity", "resolved");

-- AddForeignKey
ALTER TABLE "dpo_jobs" ADD CONSTRAINT "dpo_jobs_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
