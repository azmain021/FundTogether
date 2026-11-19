import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { publicUser } from './public-user';
import { Session } from './schemas/session.schema';

export const SESSION_COOKIE = 'fundtogether_session';
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export function sessionToken(cookie: string | undefined): string | undefined {
  const value = cookie?.split(';').map(part => part.trim())
    .find(part => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : undefined;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(userId: string, credentialVersion = 0): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.sessionModel.create({
      userId: new Types.ObjectId(userId),
      tokenHash: this.hash(token),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      credentialVersion,
    });
    return token;
  }

  async currentUser(token: string | undefined) {
    if (!token) throw new UnauthorizedException('Please log in to continue');
    const session = await this.sessionModel.findOne({
      tokenHash: this.hash(token),
      expiresAt: { $gt: new Date() },
    }).exec();
    if (!session) throw new UnauthorizedException('Your session has expired. Please log in again');
    const user = await this.userModel.findById(session.userId).exec();
    if (!user?.isActive || (user.credentialVersion ?? 0) !== (session.credentialVersion ?? 0)) {
      throw new UnauthorizedException('Please log in to continue');
    }
    return publicUser(user);
  }

  async revoke(token: string | undefined): Promise<void> {
    if (token) await this.sessionModel.deleteOne({ tokenHash: this.hash(token) }).exec();
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
