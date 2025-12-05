// lib/formatters.ts

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return "—";

  const abs = Math.abs(value);

  if (abs >= 1e9) {
    return `${(value / 1e9).toFixed(2).replace(/\.?0+$/, "")}B`;
  }
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  if (abs >= 1e3) {
    return `${(value / 1e3).toFixed(2).replace(/\.?0+$/, "")}K`;
  }
  if (abs < 0.01 && abs > 0) {
    return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}

// Optional: with $ sign
export function formatUSD(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return "$—";
  return `$${formatNumber(value)}`;
}

// Optional: for percentages
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return "—%";
  return `${value.toFixed(2).replace(/\.?0+$/, "")}%`;
}

export const formatFees = (fees: any) => {
  if (!fees) return "0%";
  if (typeof fees === "string") return fees;

  const perf = fees.performanceFee ?? fees.perfFee ?? 0;
  const mgmt = fees.managementFee ?? fees.managementFee ?? 0;
  const deposit = fees.depositFee ?? 0;
  const withdrawal = fees.withdrawalFee ?? 0;

  const total = perf + mgmt + deposit + withdrawal;
  return total > 0 ? `${total.toFixed(1)}%` : "Free";
};

function formatReturn(amount: number, percentage: number): string {
  return `$${((amount * percentage) / 100).toFixed(2)}`;
}

export function formatCurrency(
  value: string | number,
  currency?: string
): string {
  // Convert to string and remove all non-numeric except "."
  let cleanValue = String(value).replace(/[^0-9.]/g, "");

  // Prevent multiple dots (like "12.3.4")
  const parts = cleanValue.split(".");
  if (parts.length > 2) cleanValue = parts[0] + "." + parts.slice(1).join("");

  // Parse as float
  const numericValue = parseFloat(cleanValue);
  if (isNaN(numericValue)) return cleanValue; // Return raw for partial typing (like "0.")

  // Format number
  const formatted = numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Add ₦ if NGN or ₦
  if (currency === "NGN" || currency === "₦") {
    return `₦${formatted}`;
  }

  // If user still typing a decimal point at end, preserve it
  if (cleanValue.endsWith(".")) return formatted + ".";

  return formatted;
}
