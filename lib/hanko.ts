import { tenant } from "@teamhanko/passkeys-next-auth-provider";

// Hanko passkeys are optional - only initialize if credentials are provided
let hanko: ReturnType<typeof tenant> | null = null;

if (process.env.HANKO_API_KEY && process.env.NEXT_PUBLIC_HANKO_TENANT_ID) {
  hanko = tenant({
    apiKey: process.env.HANKO_API_KEY,
    tenantId: process.env.NEXT_PUBLIC_HANKO_TENANT_ID,
  });
} else {
  console.warn(
    "[Hanko] HANKO_API_KEY and NEXT_PUBLIC_HANKO_TENANT_ID not set - passkey authentication disabled"
  );
}

export default hanko;
