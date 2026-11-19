import { Equals, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { CampaignStatus, ReviewDecision } from '../../common/enums';
import { Trim } from '../../common/transforms';

export class ReviewCampaignDto {
  @IsEnum(ReviewDecision)
  decision: ReviewDecision;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  version: number;

  @Trim()
  @ValidateIf((dto: ReviewCampaignDto) => dto.decision === ReviewDecision.Rejected || dto.feedback !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  feedback?: string;
}

export class CampaignReviewQueueDto {
  @IsOptional()
  @Equals(CampaignStatus.PendingReview)
  status?: CampaignStatus.PendingReview;
}
