export const jwtConstants = {
  secret: process.env.JWT_SECRET as string,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRESIN as string,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRESIN as string,
};
