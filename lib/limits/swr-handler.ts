/**
 * SWR limits handler - AGPL implementation
 */

import { DEFAULT_PLAN_LIMITS } from "./constants";

/**
 * SWR hook for limits (returns unlimited for self-hosted)
 */
export function useLimits() {
  return {
    limits: DEFAULT_PLAN_LIMITS,
    loading: false,
    error: null,
    // AGPL: All actions are always allowed
    canAddDocuments: true,
    canAddDatarooms: true,
    canAddLinks: true,
    canAddDomains: true,
    canAddUsers: true,
    showUpgradePlanModal: false,
  };
}
