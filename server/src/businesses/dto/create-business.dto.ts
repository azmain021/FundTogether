import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { BusinessSector, BusinessSize, BusinessType } from '../../common/enums';
import { Trim } from '../../common/transforms';

// Request shape for POST /api/businesses. Anything not listed here (ownerId,
// verificationStatus, ...) is rejected by the global ValidationPipe.
export class CreateBusinessDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  officialName: string;

  @IsEnum(BusinessType)
  businessType: BusinessType;

  @IsEnum(BusinessSector)
  sector: BusinessSector;

  @IsEnum(BusinessSize)
  size: BusinessSize;

  // Upper bound (current year) is checked in BusinessesService.
  @IsInt()
  @Min(1900)
  establishedYear: number;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  operatingHistory?: string;

  @IsInt()
  @Min(0)
  @Max(1_000_000)
  employeeCount: number;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  division: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  district: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  address: string;

  @Trim()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string;

  @Trim()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' && !value.trim() ? null : value)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  website?: string | null;

  @Trim()
  @IsEmail()
  businessEmail: string;

  // Accepts 01XXXXXXXXX, +8801XXXXXXXXX or 8801XXXXXXXXX; spaces and hyphens are ignored.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/[\s-]/g, '') : value,
  )
  @Matches(/^(?:\+?880|0)1[3-9]\d{8}$/, {
    message: 'contactPhone must be a valid Bangladeshi mobile number',
  })
  contactPhone: string;
}
