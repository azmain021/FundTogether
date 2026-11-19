import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAX_DOCUMENT_BYTES, UploadedDocument } from './document-types';
import { StorageService, validateDocument } from './storage.service';

const file = (buffer: Buffer, mimetype: string): UploadedDocument => ({ buffer, mimetype, size: buffer.length, originalname: 'synthetic-test.pdf' });

describe('Document file validation', () => {
  it.each([
    [Buffer.from('%PDF-1.4\nsynthetic fixture'), 'application/pdf', 'pdf'],
    [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]), 'image/png', 'png'],
    [Buffer.from([255, 216, 255, 224]), 'image/jpeg', 'jpg'],
  ])('recognizes an allowed signature and matching MIME type', (buffer, mime, extension) => {
    expect(validateDocument(file(buffer as Buffer, mime as string)).extension).toBe(extension);
  });

  it('rejects an executable renamed to PDF', () => {
    expect(() => validateDocument(file(Buffer.from('MZ executable'), 'application/pdf'))).toThrow(BadRequestException);
  });

  it('rejects a MIME type that does not match the file bytes', () => {
    expect(() => validateDocument(file(Buffer.from('%PDF-1.4'), 'image/png'))).toThrow(BadRequestException);
  });

  it('rejects empty, missing and oversized files', () => {
    expect(() => validateDocument(undefined)).toThrow(BadRequestException);
    expect(() => validateDocument(file(Buffer.alloc(0), 'application/pdf'))).toThrow(BadRequestException);
    expect(() => validateDocument(file(Buffer.alloc(MAX_DOCUMENT_BYTES + 1), 'application/pdf'))).toThrow(BadRequestException);
  });

  it('does not read arbitrary filesystem paths', async () => {
    const storage = new StorageService({ get: () => undefined } as unknown as ConfigService);
    await expect(storage.stream('../../.env')).rejects.toThrow(BadRequestException);
  });
});
