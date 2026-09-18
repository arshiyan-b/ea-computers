import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider, UploadableFile, UploadedFileResult } from './storage/storage-provider.interface';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { S3StorageProvider } from './storage/s3-storage.provider';
import { CloudinaryStorageProvider } from './storage/cloudinary-storage.provider';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

@Injectable()
export class UploadsService {
  private readonly provider: StorageProvider;

  constructor(
    config: ConfigService,
    local: LocalStorageProvider,
    s3: S3StorageProvider,
    cloudinary: CloudinaryStorageProvider,
  ) {
    const selected = config.get<string>('STORAGE_PROVIDER', 'local');
    this.provider = { local, s3, cloudinary }[selected] ?? local;
  }

  async uploadImage(file: UploadableFile | undefined, folder?: string): Promise<UploadedFileResult> {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WEBP or AVIF images are allowed');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File exceeds the 5MB size limit');
    }
    return this.provider.upload(file, folder);
  }
}
