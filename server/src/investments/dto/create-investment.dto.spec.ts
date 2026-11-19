import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateInvestmentDto } from './create-investment.dto';

const purchase = {
  campaignId: '1234567890abcdef12345678',
  units: 12,
  idempotencyKey: '779DFB95-D7A9-4668-834E-FC4A38920100',
};

describe('CreateInvestmentDto', () => {
  it('normalizes the purchase key before validation and lookup', async () => {
    const dto = plainToInstance(CreateInvestmentDto, purchase);
    expect(await validate(dto)).toEqual([]);
    expect(dto.idempotencyKey).toBe(purchase.idempotencyKey.toLowerCase());
  });

  it.each([
    { idempotencyKey: '00000000-0000-0000-0000-000000000000' },
    { idempotencyKey: 'ffffffff-ffff-ffff-ffff-ffffffffffff' },
    { units: 0 },
    { units: 10_001 },
    { units: 1.5 },
    { units: '12' },
    { campaignId: 'not-a-campaign-id' },
    { unitPrice: 1 },
  ])('rejects invalid or unsupported purchase input: %j', async override => {
    const dto = plainToInstance(CreateInvestmentDto, { ...purchase, ...override });
    expect(await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).not.toHaveLength(0);
  });
});
