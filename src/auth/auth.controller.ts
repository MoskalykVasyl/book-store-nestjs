import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RegisterUserDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { AuthRequest } from './types/interfaces';
import { CurrentUser } from './decorators/current-user.decorators';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(res, req.user);
  }

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(res, registerUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser('id') userId: string,
  ) {
    return this.authService.logout(res, userId);
  }

  @Get('refresh-token')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;

    if (!refreshToken) {
      throw new ForbiddenException('No refresh token!');
    }

    const payload = this.jwtService.verify(refreshToken);

    const tokens = await this.authService.refresh(payload.id, refreshToken);

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    return { accessToken: tokens.access_token };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
