import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ImageService {
  private readonly s3Client: S3Client;

  private readonly bucketName = process.env.OBJECT_STORAGE_BUCKET_NAME;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.OBJECT_STORAGE_REGION,
      endpoint: process.env.OBJECT_STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.OBJECT_STORAGE_SECRET_KEY,
      },
    });
  }

  async getUploadUrl(name: string) {
    const key = this.generateKey(name);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  private generateKey(name: string) {
    return uuidv4() + name;
  }
}
