export const jwtConstants = {
  secret: process.env.JWT_SECRET as string,
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRESIN as string,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRESIN as string,
};

export const REFRESH_TOKEN_COOKIE = 'refresh_token';
