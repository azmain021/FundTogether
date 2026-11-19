import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/transforms';

export class RegisterBusinessOwnerDto {
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @Trim()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/[\s-]/g, '') : value,
  )
  @IsString()
  @Matches(/^(?:\+?880|0)1[3-9]\d{8}$/, {
    message: 'phone must be a valid Bangladeshi mobile number',
  })
  phone: string;

  @IsBoolean()
  @Equals(true, { message: 'You must accept the terms and conditions' })
  acceptedTerms: boolean;
}
