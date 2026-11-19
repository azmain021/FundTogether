import { Body, Controller, Header, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from './current-user.decorator';
import type { CurrentAccount } from './current-user.decorator';
import { ResetPasswordDto, RotateRecoveryCodeDto } from './dto/password-reset.dto';
import { PasswordResetService } from './password-reset.service';
import { SessionOriginGuard } from './session-origin.guard';
import { SessionGuard } from './session.guard';

@Controller('auth')
@UseGuards(SessionOriginGuard, ThrottlerGuard)
export class PasswordResetController {
  constructor(private readonly passwords: PasswordResetService) {}

  @Post('reset-password')
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 12, ttl: 900_000 } })
  reset(@Body() dto: ResetPasswordDto) {
    return this.passwords.reset(dto.email, dto.recoveryCode, dto.password);
  }

  @Post('recovery-code')
  @UseGuards(SessionGuard)
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  async rotate(@CurrentUser() user: CurrentAccount, @Body() dto: RotateRecoveryCodeDto) {
    return { recoveryCode: await this.passwords.rotate(user.id, dto.currentPassword) };
  }
}
