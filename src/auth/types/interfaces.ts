import { UserRole } from '@prisma/client';

export interface AccessToken {
  access_token: string;
}

export interface RequestWithUser {
  user: {
    role: UserRole;
  };
}
