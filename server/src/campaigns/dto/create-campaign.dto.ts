import { IsInt, IsMongoId, IsNotEmpty, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Trim } from '../../common/transforms';

// Request shape for POST /api/campaigns. totalUnits, remainingUnits, status and
// version are computed by CampaignsService and rejected if sent.
export class CreateCampaignDto {
  @IsMongoId()
  businessId: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @Trim()
  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  description: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  purpose: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  useOfFunds: string;

  // Whole virtual taka (D-07).
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  fundingTarget: number;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  unitPrice: number;

  // D-05: campaigns last 7–90 days.
  @IsInt()
  @Min(7)
  @Max(90)
  durationDays: number;
}
