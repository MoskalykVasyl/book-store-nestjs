import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { RegisterUserDto } from 'src/auth/dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return user;
  }

  async createUser(createUserDto: RegisterUserDto): Promise<User> {
    return this.prismaService.user.create({ data: createUserDto });
  }
}
