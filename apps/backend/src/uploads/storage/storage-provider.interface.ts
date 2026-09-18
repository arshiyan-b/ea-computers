export interface UploadedFileResult {
  url: string;
  key: string;
}

/** An in-memory file buffer, decoupled from any particular HTTP/multipart library. */
export interface UploadableFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Storage is provider-agnostic by design: swap `STORAGE_PROVIDER` between
 * "local", "s3" (any S3-compatible endpoint — AWS, MinIO, DigitalOcean
 * Spaces, Cloudflare R2, ...) and "cloudinary" without touching callers.
 */
export interface StorageProvider {
  upload(file: UploadableFile, folder?: string): Promise<UploadedFileResult>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
