/**
 * Storage configuration for S3-compatible storage (AWS S3, MinIO, etc.)
 *
 * This is an AGPL-licensed clean-room implementation for managing storage configurations.
 * Supports multi-region storage and team-specific configurations.
 */

export interface StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export type StorageRegion = "eu-central-1" | "us-east-1" | "us-east-2";

/**
 * Gets storage configuration from environment variables.
 * Supports multi-region setup with optional _US suffix for US region.
 *
 * @param storageRegion - Optional storage region (defaults to primary region)
 * @returns StorageConfig object with S3 configuration
 */
export function getStorageConfig(storageRegion?: string): StorageConfig {
  const isUS = storageRegion === "us-east-2";
  const suffix = isUS ? "_US" : "";

  const bucket = process.env[`NEXT_PRIVATE_UPLOAD_BUCKET${suffix}`];
  const accessKeyId = process.env[`NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID${suffix}`];
  const secretAccessKey = process.env[`NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY${suffix}`];

  if (!bucket) {
    throw new Error(`Missing environment variable: NEXT_PRIVATE_UPLOAD_BUCKET${suffix}`);
  }
  if (!accessKeyId) {
    throw new Error(`Missing environment variable: NEXT_PRIVATE_UPLOAD_ACCESS_KEY_ID${suffix}`);
  }
  if (!secretAccessKey) {
    throw new Error(`Missing environment variable: NEXT_PRIVATE_UPLOAD_SECRET_ACCESS_KEY${suffix}`);
  }

  const region = process.env[`NEXT_PRIVATE_UPLOAD_REGION${suffix}`] || (isUS ? "us-east-2" : "eu-central-1");
  const endpoint = process.env[`NEXT_PRIVATE_UPLOAD_ENDPOINT${suffix}`];
  const forcePathStyle = process.env.NEXT_PRIVATE_UPLOAD_FORCE_PATH_STYLE === "true";

  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint,
    forcePathStyle,
  };
}

/**
 * Gets storage configuration for a specific team.
 * Currently returns default config, but can be extended for team-specific storage.
 *
 * @param teamId - The team ID
 * @returns Promise<StorageConfig> - The storage configuration
 */
export async function getTeamStorageConfigById(
  teamId: string,
): Promise<StorageConfig> {
  // For now, all teams use the same storage config
  // Future: Can be extended to support team-specific storage regions/buckets
  // by querying team settings from database

  try {
    // Default to primary region
    return getStorageConfig();
  } catch (error) {
    console.warn(
      "Failed to get storage config for team %s:",
      teamId,
      error,
    );
    // Fallback to default config
    return getStorageConfig();
  }
}

/**
 * Multi-region S3 Store stub
 * Advanced multi-region storage features were in commercial /ee
 * For now, this is a simple stub - extend as needed
 */
export class MultiRegionS3Store {
  constructor(config?: any) {}
  
  async upload(file: any, options?: any) {
    throw new Error("MultiRegionS3Store: Advanced storage features not yet implemented");
  }
  
  async download(key: string) {
    throw new Error("MultiRegionS3Store: Advanced storage features not yet implemented");
  }
}
