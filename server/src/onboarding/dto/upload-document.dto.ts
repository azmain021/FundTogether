import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { DocumentType } from '../document-types';

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsOptional()
  @IsMongoId()
  replacesDocumentId?: string;
}
