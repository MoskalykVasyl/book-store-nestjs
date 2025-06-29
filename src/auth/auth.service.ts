import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { AccessToken } from './types/interfaces';
import { RegisterUserDto } from './dto/register.dto';

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

  async login(user: User): Promise<AccessToken> {
    const payload = { email: user.email, id: user.id };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async register(registerUserDto: RegisterUserDto): Promise<AccessToken> {
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
    return this.login(createdUser);
  }
}
