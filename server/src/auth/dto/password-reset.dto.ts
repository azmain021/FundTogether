import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Trim } from '../../common/transforms';

export class ResetPasswordDto {
  @Trim()
  @IsEmail()
  @MaxLength(254)
  email: string;
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase().replace(/[\s-]/g, '') : value,
  )
  @IsString()
  @Matches(/^[a-f0-9]{32}$/, { message: 'Enter a valid recovery code' })
  recoveryCode: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

export class RotateRecoveryCodeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  currentPassword: string;
}
