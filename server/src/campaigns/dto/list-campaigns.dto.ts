import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { CampaignStatus } from '../../common/enums';

export class ListCampaignsDto {
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsMongoId()
  businessId?: string;
}
