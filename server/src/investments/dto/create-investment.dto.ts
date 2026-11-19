import { Transform } from 'class-transformer';
import { IsInt, IsMongoId, Matches, Max, Min } from 'class-validator';
import { INVESTMENT_KEY_PATTERN } from '../schemas/investment.schema';

export class CreateInvestmentDto {
  @IsMongoId()
  campaignId: string;

  @IsInt()
  @Min(1)
  @Max(10_000)
  units: number;

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.toLowerCase() : value)
  @Matches(INVESTMENT_KEY_PATTERN, { message: 'idempotencyKey must be a UUID' })
  idempotencyKey: string;
}
