import { VerificationStatus } from '../common/enums';

export enum DocumentType {
  TradeLicence = 'trade_licence',
  TaxEvidence = 'tax_evidence',
  OwnerIdentity = 'owner_identity',
  BankAccountEvidence = 'bank_account_evidence',
  AddressProof = 'address_proof',
  OtherSupporting = 'other_supporting',
}

export const REQUIRED_DOCUMENT_TYPES = [
  DocumentType.TradeLicence, DocumentType.TaxEvidence,
  DocumentType.OwnerIdentity, DocumentType.BankAccountEvidence,
];
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const EDITABLE_BUSINESS_STATUSES: VerificationStatus[] = [VerificationStatus.Draft, VerificationStatus.Rejected, VerificationStatus.ChangesRequested];

export type UploadedDocument = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};
