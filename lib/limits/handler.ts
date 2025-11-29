/**
 * Client-side limits handler - AGPL implementation
 */

import { DEFAULT_PLAN_LIMITS } from "./constants";

/**
 * Check if a feature is allowed (always returns true for self-hosted)
 */
export function isFeatureAllowed(feature: string): boolean {
  return true;
}

/**
 * Check if limit is reached (always returns false for self-hosted)
 */
export function isLimitReached(limitType: string, current: number): boolean {
  return false;
}

/**
 * Get remaining count (always returns high number for self-hosted)
 */
export function getRemaining(limitType: string, current: number): number {
  return 999999;
}

export { DEFAULT_PLAN_LIMITS as PLAN_LIMITS };
