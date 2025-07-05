import { User, UserRole } from '@prisma/client';

export interface AccessToken {
  access_token: string;
}

export interface RequestWithUser {
  user: {
    role: UserRole;
  };
}

export interface AuthRequest extends Request {
  user: User;
}

export interface Token {
  access_token: string;
  refresh_token: string;
}
