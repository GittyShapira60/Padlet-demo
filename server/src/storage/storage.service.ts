import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const DATA_URI_PATTERN = /^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/;

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    this.bucket = this.configService.get<string>('S3_BUCKET', 'padlet-images');
    this.publicUrl = this.configService.get<string>('S3_PUBLIC_URL', endpoint);

    this.client = new S3Client({
      endpoint,
      region: this.configService.get<string>('S3_REGION', 'us-east-1'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY', ''),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY', ''),
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Created S3 bucket "${this.bucket}"`);
    } catch (error) {
      const code = (error as { name?: string }).name;
      if (code !== 'BucketAlreadyOwnedByYou' && code !== 'BucketAlreadyExists') {
        this.logger.error(`Failed to create S3 bucket "${this.bucket}"`, error as Error);
        return;
      }
    }

    try {
      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucket}/*`],
              },
            ],
          }),
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to set public-read policy on bucket "${this.bucket}"`, error as Error);
    }
  }

  /**
   * Uploads a base64 data-URI image and returns its public URL. Callers keep
   * sending/receiving plain image data URIs or URLs interchangeably — both
   * render fine in an <img src>, so no API contract change was needed.
   */
  async uploadImage(dataUri: string): Promise<string> {
    const match = DATA_URI_PATTERN.exec(dataUri);
    if (!match) {
      throw new Error('Invalid image data URI');
    }

    const [, extension, base64Payload] = match;
    const key = `${randomUUID()}.${extension}`;
    const body = Buffer.from(base64Payload, 'base64');

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: `image/${extension}`,
      }),
    );

    return `${this.publicUrl}/${this.bucket}/${key}`;
  }
}
