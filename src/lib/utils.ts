import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely convert a nullable number to a display value.
 * Returns 0 if the value is null, undefined, or NaN.
 * Optionally rounds to specified decimal places.
 * 
 * @param value - The potentially null/undefined number
 * @param decimals - Number of decimal places (default: 1)
 * @returns A number safe for display (never null/undefined)
 */
export function safeNumber(value: number | null | undefined, decimals: number = 1): number {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return Number(value.toFixed(decimals));
}

/**
 * Format a percentage value for display.
 * Handles null/undefined by returning "0%".
 * 
 * @param value - The percentage value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  return `${safeNumber(value, decimals)}%`;
}

/**
 * Determine trend direction based on a difference value.
 * 
 * @param diff - The difference/change value
 * @returns 'up' | 'down' | 'neutral'
 */
export function getTrendDirection(diff: number | null | undefined): 'up' | 'down' | 'neutral' {
  const safeDiff = safeNumber(diff, 1);
  if (safeDiff > 0) return 'up';
  if (safeDiff < 0) return 'down';
  return 'neutral';
}

/**
 * Get status based on percentage value.
 * 
 * @param value - The percentage value
 * @param thresholds - Custom thresholds (default: healthy >= 85, warning >= 70)
 * @returns 'healthy' | 'warning' | 'critical'
 */
export function getStatusFromPercentage(
  value: number | null | undefined,
  thresholds: { healthy: number; warning: number } = { healthy: 85, warning: 70 }
): 'healthy' | 'warning' | 'critical' {
  const safeVal = safeNumber(value, 1);
  if (safeVal >= thresholds.healthy) return 'healthy';
  if (safeVal >= thresholds.warning) return 'warning';
  return 'critical';
}
