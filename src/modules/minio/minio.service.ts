import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import internal from 'stream';
import { BucketType } from 'src/commons/enums/bucket_type';

@Injectable()
export class MinioService implements OnModuleInit {
  private static minioClient: Minio.Client;

  async onModuleInit() {
    if (!MinioService.minioClient) {
      MinioService.minioClient = new Minio.Client({
        endPoint: 'rociny-minio',
        port: parseInt(process.env.MINIO_PORT),
        useSSL: process.env.MINIO_SCHEME === 'https',
        accessKey: process.env.MINIO_ROOT_USER,
        secretKey: process.env.MINIO_ROOT_PASSWORD,
      });
    }
  }

  /**
   * Uploads a file to the specified MinIO bucket.
   *
   * This function generates a unique filename using a UUID, appends the file's original extension,
   * and uploads the file to the specified bucket in MinIO. It returns the unique filename
   * generated for the uploaded file.
   *
   * @param {Express.Multer.File} file - The file object provided by Multer, containing metadata and the file buffer.
   * @param {BucketType} bucket - The name of the MinIO bucket where the file should be uploaded.
   * @returns {Promise<String>} - A promise that resolves to the unique filename of the uploaded file.
   */
  async uploadFile(
    file: Express.Multer.File,
    bucket: BucketType,
  ): Promise<string> {
    const parsedName = path.parse(file.originalname).name;
    const fileName = `${parsedName}-${uuidv4()}${path.extname(file.originalname)}`;
    await MinioService.minioClient.putObject(
      bucket,
      fileName,
      file.buffer,
      file.size,
    );
    return fileName;
  }

  /**
   * Retrieves a file from the specified MinIO bucket.
   *
   * This function fetches a file as a readable stream from the given bucket and file name.
   * The returned stream can be used to read the file's content or pipe it to another destination.
   *
   * @param {string} bucketName - The name of the MinIO bucket where the file is stored.
   * @param {string} fileName - The name of the file to retrieve from the bucket.
   * @returns {Promise<internal.Readable>} - A promise that resolves to a readable stream of the file's content.
   */
  async getFile(
    bucketName: string,
    fileName: string,
  ): Promise<internal.Readable> {
    const file = await MinioService.minioClient.getObject(bucketName, fileName);
    return file;
  }

  /**
   * Deletes a file from the specified MinIO bucket.
   *
   * This function removes the specified file from the given bucket in MinIO. If the file does not exist,
   * MinIO will ignore the request without throwing an error.
   *
   * @param {BucketType} bucket - The name of the MinIO bucket where the file is stored.
   * @param {string} fileName - The name of the file to delete from the bucket.
   * @returns {Promise<void>} - A promise that resolves when the file has been successfully deleted.
   */
  async removeFile(bucket: BucketType, fileName: string): Promise<void> {
    await MinioService.minioClient.removeObject(bucket, fileName);
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    bucket: BucketType,
    contentType = 'application/pdf',
  ): Promise<string> {
    const parsed = path.parse(originalName);
    const fileName = `${parsed.name}-${uuidv4()}${parsed.ext || '.pdf'}`;

    await MinioService.minioClient.putObject(
      bucket,
      fileName,
      buffer,
      buffer.length,
      { 'Content-Type': contentType },
    );

    return fileName;
  }
}
