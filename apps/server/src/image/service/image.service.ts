import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '@/account/user.service';
import { PresignedUrlResponse } from '../dto/presigned-url-response.dto';
import { AccessUrlResponse } from '../dto/access-url-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageService {
  private readonly s3Client: S3Client;
  private readonly bucketName = this.configService.get<string>('OBJECT_STORAGE_BUCKET_NAME');

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('OBJECT_STORAGE_REGION'),
      endpoint: this.configService.get<string>('OBJECT_STORAGE_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('OBJECT_STORAGE_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('OBJECT_STORAGE_SECRET_KEY'),
      },
    });
    this.setBucketCors();
  }

  async setBucketCors() {
    const corsRules = [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST'],
        AllowedOrigins: ['http://localhost:5173', 'http://boost-harmony.kro.kr'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ];

    const command = new PutBucketCorsCommand({
      Bucket: this.bucketName,
      CORSConfiguration: {
        CORSRules: corsRules,
      },
    });

    await this.s3Client.send(command);
  }

  async getUploadUrl(name: string) {
    const key = this.generateKey(name);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ACL: 'public-read',
    });

    return new PresignedUrlResponse(
      await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }),
      key
    );
  }

  async getAccessUrl(id: number, key: string) {
    const accessUrl = `${this.configService.get<string>('OBJECT_STORAGE_ENDPOINT')}/${this.bucketName}/${key}`;
    await this.userService.updateProfileImage(id, accessUrl);
    return new AccessUrlResponse(accessUrl);
  }

  private generateKey(name: string) {
    return uuidv4() + name;
  }
}
