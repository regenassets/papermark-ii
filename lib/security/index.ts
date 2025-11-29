/**
 * Security features - AGPL implementation
 * Provides rate limiting and basic fraud prevention
 */

// Re-export access notifications
export { reportDeniedAccessAttempt } from "./access-notifications";

// Simple rate limiting stub
// TODO: Implement proper rate limiting using express-rate-limit or similar
export const ratelimit = {
  limit: async (identifier: string) => {
    // Stub implementation - always allow for now
    // In production, implement proper rate limiting
    return { success: true, remaining: 100, reset: Date.now() + 60000 };
  },
};

// Rate limiter stubs for NextAuth compatibility
export const checkRateLimit = async (limiter: any, identifier: string) => {
  // Stub - always allow for development
  return { success: true };
};

export const rateLimiters = {
  auth: {
    check: async (identifier: string) => ({ success: true }),
  },
  login: {
    check: async (identifier: string) => ({ success: true }),
  },
  signup: {
    check: async (identifier: string) => ({ success: true }),
  },
  billing: {
    check: async (identifier: string) => ({ success: true }),
  },
};

// Fraud prevention stub
export const fraudPrevention = {
  checkEmail: async (email: string) => {
    // Stub - basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  checkIP: async (ip: string) => {
    // Stub - allow all IPs for now
    return true;
  },
};
