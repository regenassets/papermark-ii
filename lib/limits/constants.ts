/**
 * Plan limits - AGPL implementation
 * For self-hosted version, all limits are unlimited/removed
 */

export type TPlanLimits = {
  users: number | null;
  links: number | null;
  documents: number | null;
  domains: number | null;
  datarooms: number | null;
  customDomainOnPro: boolean;
  customDomainInDataroom: boolean;
  advancedLinkControlsOnPro: boolean | null;
  watermarkOnBusiness?: boolean | null;
  agreementOnBusiness?: boolean | null;
  conversationsInDataroom?: boolean | null;
};

// Self-hosted version: Everything is unlimited
export const DEFAULT_PLAN_LIMITS: TPlanLimits = {
  users: null, // unlimited
  links: null, // unlimited
  documents: null, // unlimited
  domains: null, // unlimited
  datarooms: null, // unlimited
  customDomainOnPro: true,
  customDomainInDataroom: true,
  advancedLinkControlsOnPro: true,
  watermarkOnBusiness: true,
  agreementOnBusiness: true,
  conversationsInDataroom: true,
};

// Legacy exports for compatibility
export const FREE_PLAN_LIMITS = DEFAULT_PLAN_LIMITS;
export const PRO_PLAN_LIMITS = DEFAULT_PLAN_LIMITS;
export const BUSINESS_PLAN_LIMITS = DEFAULT_PLAN_LIMITS;
export const DATAROOMS_PLAN_LIMITS = DEFAULT_PLAN_LIMITS;
export const DATAROOMS_PLUS_PLAN_LIMITS = DEFAULT_PLAN_LIMITS;
export const PAUSED_PLAN_LIMITS = {
  canCreateLinks: true,
  canReceiveViews: true,
  canCreateDocuments: true,
  canCreateDatarooms: true,
  canViewAnalytics: true,
  canAccessExistingContent: true,
};
