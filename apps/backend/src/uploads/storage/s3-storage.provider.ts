import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { StorageProvider, UploadableFile, UploadedFileResult } from './storage-provider.interface';

/**
 * Works with AWS S3 and any S3-compatible service (MinIO, Spaces, R2, ...).
 * Config is only read/validated lazily, on first upload — not in the
 * constructor — so this provider can sit unused (and un-configured) in dev
 * without crashing app bootstrap when STORAGE_PROVIDER=local.
 */
@Injectable()
export class S3StorageProvider implements StorageProvider {
  private client?: S3Client;
  private bucket?: string;
  private publicUrl?: string;

  constructor(private readonly config: ConfigService) {}

  private getClient(): S3Client {
    if (this.client) return this.client;
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');
    this.publicUrl = this.config.get<string>('S3_PUBLIC_URL');
    this.client = new S3Client({
      region: this.config.get<string>('S3_REGION', 'us-east-1'),
      endpoint: this.config.get<string>('S3_ENDPOINT') || undefined,
      forcePathStyle: !!this.config.get<string>('S3_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.config.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });
    return this.client;
  }

  async upload(file: UploadableFile, folder = 'products'): Promise<UploadedFileResult> {
    const client = this.getClient();
    const key = `${folder}/${randomUUID()}${extname(file.originalname)}`;
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    const url = this.publicUrl
      ? `${this.publicUrl.replace(/\/$/, '')}/${key}`
      : `https://${this.bucket}.s3.amazonaws.com/${key}`;
    return { url, key };
  }
}
