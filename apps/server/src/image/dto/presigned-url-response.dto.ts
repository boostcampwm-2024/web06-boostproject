export class PresignedUrlResponse {
  presignedUrl: string;

  key: string;

  constructor(presignedUrl: string, key: string) {
    this.presignedUrl = presignedUrl;
    this.key = key;
  }
}
