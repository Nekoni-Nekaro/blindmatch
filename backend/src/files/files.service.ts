import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/mp4'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class FilesService {
  private s3: AWS.S3;
  private bucket: string;
  private logger = new Logger('FilesService');

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      region: configService.get('AWS_REGION', 'us-east-1'),
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    });
    this.bucket = configService.get('AWS_S3_BUCKET', 'blindmatch-media');
  }

  async uploadPhoto(file: Express.Multer.File, userId: string): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image type. Allowed: JPEG, PNG, WebP');
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image too large. Max 5MB');
    }
    return this.upload(file, `photos/${userId}/${uuidv4()}`);
  }

  async uploadVoice(file: Express.Multer.File, userId: string): Promise<string> {
    if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid audio type');
    }
    if (file.size > MAX_AUDIO_SIZE) {
      throw new BadRequestException('Audio too large. Max 10MB');
    }
    return this.upload(file, `voice/${userId}/${uuidv4()}`);
  }

  private async upload(file: Express.Multer.File, key: string): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const fullKey = `${key}.${ext}`;

    try {
      const result = await this.s3
        .upload({
          Bucket: this.bucket,
          Key: fullKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
          CacheControl: 'max-age=31536000',
        })
        .promise();

      return result.Location;
    } catch (e) {
      this.logger.error(`S3 upload failed: ${e.message}`);
      throw new BadRequestException('File upload failed');
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const key = new URL(url).pathname.slice(1);
      await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
    } catch (e) {
      this.logger.warn(`S3 delete failed: ${e.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn = 300): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    });
  }
}
