-- AlterTable
ALTER TABLE "protocol_metadata" ADD COLUMN     "emissionSchedule" JSONB,
ADD COLUMN     "hasEmissions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "incentivePrograms" JSONB,
ADD COLUMN     "nextEmissionChange" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "funding_rates" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "fundingRate" DOUBLE PRECISION NOT NULL,
    "fundingRate8h" DOUBLE PRECISION,
    "openInterest" DOUBLE PRECISION,
    "volume24h" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funding_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "funding_rates_protocol_market_timestamp_idx" ON "funding_rates"("protocol", "market", "timestamp");
