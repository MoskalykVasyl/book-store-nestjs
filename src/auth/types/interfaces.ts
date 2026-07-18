import { User, UserRole } from '@prisma/client';

export interface AccessToken {
  access_token: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
export interface RequestWithUser {
  user: JwtPayload;
}

export interface AuthRequest extends Request {
  user: User;
}

export interface Token {
  access_token: string;
  refresh_token: string;
}
