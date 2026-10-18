import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishListService {
  constructor(private readonly prismaService: PrismaService) {}

  async addBook(bookId: string, userId: string) {
    try {
      return await this.prismaService.wishListItem.create({
        data: { userId, bookId },
        include: { book: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException('Book already in wishlist');
        }

        if (e.code === 'P2003') {
          throw new NotFoundException('Book not found');
        }
      }
      throw e;
    }
  }

  async removeBook(bookId: string, userId: string) {
    try {
      return await this.prismaService.wishListItem.delete({
        where: { userId_bookId: { userId, bookId } },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Book not in wishlist');
      }
      throw e;
    }
  }

  async getWishListByUserId(userId: string) {
    const items = await this.prismaService.wishListItem.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => item.book);
  }
}
