import {
  Body,
  Controller,
  Get,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
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
}
