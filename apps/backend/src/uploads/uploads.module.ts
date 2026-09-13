import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { S3StorageProvider } from './storage/s3-storage.provider';
import { CloudinaryStorageProvider } from './storage/cloudinary-storage.provider';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, LocalStorageProvider, S3StorageProvider, CloudinaryStorageProvider],
})
export class UploadsModule {}
