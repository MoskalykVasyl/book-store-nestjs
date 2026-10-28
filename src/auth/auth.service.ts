import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { createHash, timingSafeEqual } from 'crypto';
import { AccessToken, JwtPayload, Token } from './types/interfaces';
import { RegisterUserDto } from './dto/register.dto';
import { jwtConstants, REFRESH_TOKEN_COOKIE } from './constants';
import { CookieOptions, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/userResponse.dto';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    // однакова відповідь, щоб не можна було перевірити, чи існує email
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Wrong password or email!');
    }

    return user;
  }

  async login(res: Response, user: User): Promise<AccessToken> {
    return this.auth(res, user);
  }

  async register(
    res: Response,
    registerUserDto: RegisterUserDto,
  ): Promise<AccessToken> {
    const existingUser = await this.userService.findByEmail(
      registerUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email has already been used!');
    }

    const hashPassword = await bcrypt.hash(registerUserDto.password, 10);
    const newUser: RegisterUserDto = {
      ...registerUserDto,
      password: hashPassword,
    };
    const createdUser = await this.userService.createUser(newUser);
    return this.auth(res, createdUser);
  }

  async getToken(user: User): Promise<Token> {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // refresh підписується окремим секретом, тому JwtStrategy не прийме його як access token
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: jwtConstants.refreshExpiresIn,
      }),
    ]);
    return { access_token, refresh_token };
  }

  async refresh(res: Response, refreshToken?: string): Promise<AccessToken> {
    if (!refreshToken) {
      throw new ForbiddenException('No refresh token!');
    }

    let payload: JwtPayload;
    try {
      payload = await this.verifyRefreshToken(refreshToken);
    } catch {
      this.clearRefreshCookie(res);
      throw new ForbiddenException('Invalid refresh token!');
    }

    const user = await this.userService.findById(payload.id);
    if (!user || !user.refreshToken) {
      this.clearRefreshCookie(res);
      throw new ForbiddenException('Access denied!');
    }

    if (!this.isRefreshTokenMatch(refreshToken, user.refreshToken)) {
      this.clearRefreshCookie(res);
      throw new ForbiddenException('Invalid refresh token!');
    }

    return this.auth(res, user);
  }

  async logout(res: Response, refreshToken?: string) {
    this.clearRefreshCookie(res);

    if (refreshToken) {
      try {
        const payload = await this.verifyRefreshToken(refreshToken);
        await this.userService.updateRefreshToken(payload.id, null);
      } catch {
        // токен недійсний або протермінований - достатньо очистити cookie
      }
    }

    return { message: 'Logged out' };
  }

  private async auth(res: Response, user: User): Promise<AccessToken> {
    const { access_token, refresh_token } = await this.getToken(user);
    await this.userService.updateRefreshToken(
      user.id,
      this.hashRefreshToken(refresh_token),
    );

    const { exp } = this.jwtService.decode<{ exp: number }>(refresh_token);
    res.cookie(REFRESH_TOKEN_COOKIE, refresh_token, {
      ...refreshCookieOptions,
      expires: new Date(exp * 1000),
    });

    return { access_token };
  }

  private verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
      secret: jwtConstants.refreshSecret,
    });
  }

  // bcrypt враховує лише перші 72 байти, а в JWT вони однакові для всіх токенів користувача,
  // тому для refresh використовується sha256 від усього токена
  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private isRefreshTokenMatch(refreshToken: string, storedHash: string) {
    const hash = Buffer.from(this.hashRefreshToken(refreshToken));
    const stored = Buffer.from(storedHash);
    return hash.length === stored.length && timingSafeEqual(hash, stored);
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, refreshCookieOptions);
  }

  async getMe(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not Found!');
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
