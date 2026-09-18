import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { StorageProvider, UploadableFile, UploadedFileResult } from './storage-provider.interface';

/**
 * Default provider for local development: writes to ./uploads and serves it
 * back as static assets (configured in main.ts). Swap to "s3" or
 * "cloudinary" via STORAGE_PROVIDER for anything resembling production.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor(private readonly config: ConfigService) {}

  async upload(file: UploadableFile, folder = 'products'): Promise<UploadedFileResult> {
    const dir = join(this.uploadsDir, folder);
    await mkdir(dir, { recursive: true });

    const key = `${folder}/${randomUUID()}${extname(file.originalname)}`;
    await writeFile(join(this.uploadsDir, key), file.buffer);

    const port = this.config.get<number>('PORT', 4000);
    const apiPrefix = this.config.get<string>('API_PREFIX', 'api');
    const baseUrl = this.config.get<string>('PUBLIC_API_URL', `http://localhost:${port}`);
    return { url: `${baseUrl}/${apiPrefix}/uploads/static/${key}`, key };
  }
}
