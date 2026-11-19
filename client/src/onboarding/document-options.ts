import type { DocumentType } from '../api/onboarding';

export const DOCUMENT_OPTIONS: { type: DocumentType; title: string; hint: string; required: boolean }[] = [
  { type: 'trade_licence', title: 'Trade Licence', hint: 'Your current business trade licence.', required: true },
  { type: 'tax_evidence', title: 'Tax Evidence', hint: 'A TIN certificate or tax return.', required: true },
  { type: 'owner_identity', title: 'Owner Identity', hint: 'Include both sides of the NID together in one PDF or image.', required: true },
  { type: 'bank_account_evidence', title: 'Bank Account Evidence', hint: 'A bank statement or bank letter for the business.', required: true },
  { type: 'address_proof', title: 'Address Proof', hint: 'A utility bill, rental agreement or other address evidence.', required: false },
  { type: 'other_supporting', title: 'Additional Supporting Documents', hint: 'Up to three additional documents.', required: false },
];

export const documentLabel = (type: DocumentType) => DOCUMENT_OPTIONS.find(option => option.type === type)?.title ?? type;
export const statusLabel = (status: string) => status.replaceAll('_', ' ').replace(/^\w/, letter => letter.toUpperCase());
