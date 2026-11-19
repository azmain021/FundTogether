import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { BusinessSector } from '../../common/enums';

export const marketplaceStatuses = ['active', 'funded'] as const;
export const marketplaceSorts = [
  'newest',
  'ending_soon',
  'most_funded',
  'least_remaining',
] as const;

export type MarketplaceStatus = (typeof marketplaceStatuses)[number];
export type MarketplaceSort = (typeof marketplaceSorts)[number];

export class ListMarketplaceCampaignsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsIn(Object.values(BusinessSector))
  sector?: BusinessSector;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  division?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  district?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minTarget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxTarget?: number;

  @IsOptional()
  @IsIn(marketplaceStatuses)
  status?: MarketplaceStatus;

  @IsOptional()
  @IsIn(marketplaceSorts)
  sort?: MarketplaceSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}