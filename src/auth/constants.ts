export const jwtConstants = {
  secret: process.env.JWT_SECRET as string,
  expiresIn: process.env.JWT_EXPIRESIN as string,
};
