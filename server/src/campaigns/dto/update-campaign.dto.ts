import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';

// A campaign cannot be moved to another business after creation.
export class UpdateCampaignDto extends PartialType(OmitType(CreateCampaignDto, ['businessId'] as const)) {}
