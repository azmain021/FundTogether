import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { PasswordReset, RECOVERY_CODE_KIND } from './schemas/password-reset.schema';
import { Session } from './schemas/session.schema';

function hashCode(code: string) {
  return createHash('sha256').update(code).digest('hex');
}

function invalidRecoveryCode() {
  return new BadRequestException('The email or recovery code is incorrect, or the code has already been used.');
}

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(PasswordReset.name) private readonly resets: Model<PasswordReset>,
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
  ) {}

  async issueCode(userId: Types.ObjectId, session: ClientSession) {
    const code = randomBytes(16).toString('hex');
    await this.resets.updateOne(
      { userId },
      { $set: { tokenHash: hashCode(code), kind: RECOVERY_CODE_KIND }, $unset: { expiresAt: 1 } },
      { upsert: true, runValidators: true, session },
    ).exec();
    return [code.slice(0, 8), code.slice(8, 16), code.slice(16, 24), code.slice(24)].join('-');
  }

  async rotate(userId: string, currentPassword: string) {
    const invalidPassword = () => new UnauthorizedException('The current password is incorrect');
    const user = await this.users.findById(userId).select('+passwordHash').exec();
    if (!user?.isActive || !user.passwordHash || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw invalidPassword();
    }

    return this.connection.transaction(async session => {
      const currentUser = await this.users.exists({
        _id: user._id, isActive: true, passwordHash: user.passwordHash,
      }).session(session);
      if (!currentUser) throw invalidPassword();
      return this.issueCode(user._id, session);
    });
  }

  async reset(email: string, recoveryCode: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.users.findOne({ email: normalizedEmail, isActive: true }).select('_id').exec();
    if (!user) throw invalidRecoveryCode();

    const code = { userId: user._id, tokenHash: hashCode(recoveryCode), kind: RECOVERY_CODE_KIND } as const;
    if (!(await this.resets.exists(code))) throw invalidRecoveryCode();
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await this.connection.transaction(async session => {
      const match = await this.resets.findOneAndDelete(code, { session }).exec();
      if (!match) throw invalidRecoveryCode();
      const result = await this.users.updateOne(
        { _id: user._id, email: normalizedEmail, isActive: true },
        { $set: { passwordHash }, $inc: { credentialVersion: 1 } },
        { session },
      ).exec();
      if (!result.matchedCount) throw invalidRecoveryCode();
      await this.sessions.deleteMany({ userId: user._id }, { session }).exec();
    });
  }
}
