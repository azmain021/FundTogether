import { UserDocument } from '../users/schemas/user.schema';

export function publicUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    displayName: user.displayName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
  };
}
