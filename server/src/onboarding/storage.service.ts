import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MAX_DOCUMENT_BYTES, UploadedDocument } from './document-types';

export function validateDocument(file: UploadedDocument | undefined): { extension: string; mimeType: string } {
  if (!file?.buffer?.length) throw new BadRequestException('Choose a non-empty document');
  if (file.buffer.length > MAX_DOCUMENT_BYTES) throw new BadRequestException('Each file must be 5 MB or smaller');
  const bytes = file.buffer;
  const formats = [
    { extension: 'pdf', mimeType: 'application/pdf', matches: bytes.subarray(0, 5).toString('ascii') === '%PDF-' },
    { extension: 'png', mimeType: 'image/png', matches: bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
    { extension: 'jpg', mimeType: 'image/jpeg', matches: bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 },
  ];
  const format = formats.find(candidate => candidate.matches && candidate.mimeType === file.mimetype);
  if (!format) throw new BadRequestException('Only PDF, JPEG or PNG files with matching file content are allowed');
  return format;
}

@Injectable()
export class StorageService {
  private readonly directory: string;

  constructor(config: ConfigService) {
    this.directory = resolve(config.get<string>('UPLOAD_DIR') || resolve(process.cwd(), 'storage'));
  }

  async save(file: UploadedDocument): Promise<{ storageKey: string; mimeType: string }> {
    const format = validateDocument(file);
    await mkdir(this.directory, { recursive: true });
    const storageKey = `${randomUUID()}.${format.extension}`;
    await writeFile(this.filePath(storageKey), file.buffer, { flag: 'wx' });
    return { storageKey, mimeType: format.mimeType };
  }

  async read(storageKey: string): Promise<Buffer> {
    try {
      return await readFile(this.filePath(storageKey));
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
        throw new NotFoundException('Stored document not found');
      }
      throw error;
    }
  }

  async remove(storageKey: string): Promise<void> {
    await unlink(this.filePath(storageKey));
  }

  private filePath(storageKey: string): string {
    if (!/^[a-f0-9-]{36}\.(pdf|png|jpg)$/.test(storageKey)) throw new BadRequestException('Invalid document key');
    return resolve(this.directory, storageKey);
  }
}
