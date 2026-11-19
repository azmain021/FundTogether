import { AnalyticsReport, AnalyticsReportSchema } from '../analytics/schemas/analytics-report.schema';
import { AuditEvent, AuditEventSchema } from '../audit/schemas/audit-event.schema';
import { CampaignReview, CampaignReviewSchema } from '../campaigns/schemas/campaign-review.schema';
import { CampaignRevision, CampaignRevisionSchema } from '../campaigns/schemas/campaign-revision.schema';
import { Investment, InvestmentSchema } from '../investments/schemas/investment.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';
import { DocumentReview, DocumentReviewSchema } from '../onboarding/schemas/document-review.schema';
import { Transaction, TransactionSchema } from '../wallets/schemas/transaction.schema';
import { Wallet, WalletSchema } from '../wallets/schemas/wallet.schema';
import { Watchlist, WatchlistSchema } from '../watchlists/schemas/watchlist.schema';
import { PasswordReset, PasswordResetSchema } from '../auth/schemas/password-reset.schema';
import { Session, SessionSchema } from '../auth/schemas/session.schema';
import { Business, BusinessSchema } from '../businesses/schemas/business.schema';
import { Campaign, CampaignSchema } from '../campaigns/schemas/campaign.schema';
import {
  BusinessApplication, BusinessApplicationSchema, VerificationDocument, VerificationDocumentSchema,
} from '../onboarding/schemas/onboarding.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

export const authModels = [
  { name: Session.name, schema: SessionSchema },
  { name: PasswordReset.name, schema: PasswordResetSchema },
];
export const businessModels = [{ name: Business.name, schema: BusinessSchema }];
export const campaignModels = [{ name: Campaign.name, schema: CampaignSchema }];
export const onboardingModels = [
  { name: VerificationDocument.name, schema: VerificationDocumentSchema },
  { name: BusinessApplication.name, schema: BusinessApplicationSchema },
];
export const userModels = [{ name: User.name, schema: UserSchema }];
export const featureModels = [
  { name: AnalyticsReport.name, schema: AnalyticsReportSchema },
  { name: AuditEvent.name, schema: AuditEventSchema },
  { name: CampaignReview.name, schema: CampaignReviewSchema },
  { name: CampaignRevision.name, schema: CampaignRevisionSchema },
  { name: DocumentReview.name, schema: DocumentReviewSchema },
  { name: Investment.name, schema: InvestmentSchema },
  { name: Notification.name, schema: NotificationSchema },
  { name: Transaction.name, schema: TransactionSchema },
  { name: Wallet.name, schema: WalletSchema },
  { name: Watchlist.name, schema: WatchlistSchema },
];

export const databaseModels = [
  ...userModels, ...authModels, ...businessModels, ...campaignModels, ...onboardingModels, ...featureModels,
];
