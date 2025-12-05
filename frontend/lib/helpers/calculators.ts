// lib/formatters.ts (add this function)

export function calculateReturns({
  amount,
  yearlyAPY, // e.g. 12.5 (means 12.5%)
  compound = true, // set false if it's simple APR, true for APY (compounding)
}: {
  amount: number
  yearlyAPY: number
  compound?: boolean
}): {
  daily: number
  weekly: number
  monthly: number
  yearly: number
  dailyUSD: string
  weeklyUSD: string
  monthlyUSD: string
  yearlyUSD: string
} {
  if (yearlyAPY > 100) yearlyAPY /= 100 // safety: allow input as 1250 instead of 12.5

  const dailyRate = compound
    ? Math.pow(1 + yearlyAPY / 100, 1 / 365) - 1
    : yearlyAPY / 100 / 365

  const weeklyRate = compound
    ? Math.pow(1 + yearlyAPY / 100, 7 / 365) - 1
    : dailyRate * 7

  const monthlyRate = compound
    ? Math.pow(1 + yearlyAPY / 100, 30 / 365) - 1
    : dailyRate * 30

  const yearlyRate = yearlyAPY / 100

  const formatUSD = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  return {
    // Percentages
    daily: dailyRate * 100,
    weekly: weeklyRate * 100,
    monthly: monthlyRate * 100,
    yearly: yearlyAPY,

    // Dollar returns based on amount
    dailyUSD: formatUSD(amount * dailyRate),
    weeklyUSD: formatUSD(amount * weeklyRate),
    monthlyUSD: formatUSD(amount * monthlyRate),
    yearlyUSD: formatUSD(amount * yearlyRate),
  }
}