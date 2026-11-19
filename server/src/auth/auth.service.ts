import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { UserRole } from '../common/enums';
import { User } from '../users/schemas/user.schema';
import { RegisterBusinessOwnerDto } from './dto/register-business-owner.dto';
import { LoginDto } from './dto/login.dto';
import { publicUser } from './public-user';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async registerBusinessOwner(dto: RegisterBusinessOwnerDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    try {
      const user = await this.userModel.create({
        displayName: dto.fullName,
        email,
        phone: dto.phone,
        passwordHash,
        role: UserRole.BusinessOwner,
      });

      // Explicitly return public fields: select:false does not hide the hash
      // on a document that was just created.
      return publicUser(user);
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
    return publicUser(user);
  }
}
