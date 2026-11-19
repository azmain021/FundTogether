import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Connection, Model } from 'mongoose';
import { UserRole } from '../common/enums';
import { User } from '../users/schemas/user.schema';
import { RegisterBusinessOwnerDto } from './dto/register-business-owner.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetService } from './password-reset.service';
import { publicUser } from './public-user';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
    private readonly passwords: PasswordResetService,
  ) {}

  async registerBusinessOwner(dto: RegisterBusinessOwnerDto) {
    return this.register(dto, UserRole.BusinessOwner);
  }

  async registerInvestor(dto: RegisterBusinessOwnerDto) {
    return this.register(dto, UserRole.Investor);
  }

  private async register(dto: RegisterBusinessOwnerDto, role: UserRole.BusinessOwner | UserRole.Investor) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      return await this.connection.transaction(async session => {
        const [user] = await this.userModel.create([{
          displayName: dto.fullName,
          email,
          phone: dto.phone,
          passwordHash,
          role,
        }], { session });
        const recoveryCode = await this.passwords.issueCode(user._id, session);
        return { ...publicUser(user), recoveryCode };
      });
    } catch (error: unknown) {
      // The unique email index also handles simultaneous registrations.
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new ConflictException('An account with this email already exists');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.trim().toLowerCase() })
      .select('+passwordHash').exec();
    if (!user?.isActive || !user.passwordHash || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { user: publicUser(user), credentialVersion: user.credentialVersion ?? 0 };
  }
}
