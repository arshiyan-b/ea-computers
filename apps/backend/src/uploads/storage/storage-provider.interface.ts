export interface UploadedFileResult {
  url: string;
  key: string;
}

/**
 * Storage is provider-agnostic by design: swap `STORAGE_PROVIDER` between
 * "local", "s3" (any S3-compatible endpoint — AWS, MinIO, DigitalOcean
 * Spaces, Cloudflare R2, ...) and "cloudinary" without touching callers.
 */
export interface StorageProvider {
  upload(file: Express.Multer.File, folder?: string): Promise<UploadedFileResult>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
