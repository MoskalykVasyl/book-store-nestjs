import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { AccessToken, Token } from './types/interfaces';
import { RegisterUserDto } from './dto/register.dto';
import { jwtConstants } from './constants';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not Found!');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Wrong password or email!');
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
    const payload = { id: user.id, email: user.email, role: user.role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.secret,
        expiresIn: jwtConstants.refreshExpiresIn,
      }),
    ]);
    return { access_token, refresh_token };
  }

  async refresh(userId: string, refreshToken: string): Promise<Token> {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied!');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new ForbiddenException('Invalid refresh token!');
    }

    const tokens = await this.getToken(user);
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userService.updateRefreshToken(user.id, hashedRefresh);

    return tokens;
  }

  async logout(res: Response, userId: string) {
    res.clearCookie('refresh_token');
    await this.userService.updateRefreshToken(userId, null);
    return { message: 'Logged out' };
  }

  private async auth(res: Response, user: User) {
    const { access_token, refresh_token } = await this.getToken(user);
    const hashedRefresh = await bcrypt.hash(refresh_token, 10);
    await this.userService.updateRefreshToken(user.id, hashedRefresh);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token };
  }
}
