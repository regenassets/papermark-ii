// Stripe stubs - billing features removed (commercial license)
export const stripeInstance = null;
export const getSubscriptionItem = () => null;
export const getPriceIdFromPlan = () => null;
export const getDisplayNameFromPlan = (plan: string) => plan;
export const getQuantityFromPlan = () => 1;
export const getQuantityFromPriceId = () => 1;
export const getCouponFromPlan = () => null;
export const STRIPE_PLAN_IDS = {};
export const STRIPE_PRICES = {};

// Plan enum - AGPL version (all plans available, no restrictions)
export enum PlanEnum {
  Free = "free",
  Pro = "pro",
  Business = "business",
  DataRooms = "datarooms",
  DataRoomsPlus = "dataroomsplus",
}

// Plan name mapping - AGPL version (everything is "Free" since no paid plans)
export const PLAN_NAME_MAP: Record<string, string> = {
  free: "Free",
  pro: "Free",
  business: "Free",
  datarooms: "Free",
  dataroomsplus: "Free",
};

// Subscription discount type
export type SubscriptionDiscount = {
  percent_off: number | null;
  amount_off: number | null;
};

// Feature type for plan features
export type Feature = {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  isHighlighted?: boolean;
};

// Get features for a plan - AGPL version (all features enabled)
export const getPlanFeatures = (plan: PlanEnum): Feature[] => {
  // In AGPL version, all features are always enabled
  return [];
};

// Plans configuration - AGPL version (no paid plans)
export const PLANS = [
  {
    name: PlanEnum.Free,
    price: {
      monthly: { amount: 0, priceIds: {} },
      annually: { amount: 0, priceIds: {} },
    },
  },
];

// Stripe instance stub
export const getStripe = () => null;
