import { Injectable } from '@nestjs/common';
import { WishList } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishListService {
  constructor(private readonly prismaService: PrismaService) {}

  async addBook(bookId: string, userId: string) {
    return this.prismaService.wishList.upsert({
      where: { userId: userId },
      update: { bookIdList: { push: bookId } },
      create: {
        userId: userId,
        bookIdList: [bookId],
      },
    });
  }

  private async createWishList(userId: string): Promise<WishList> {
    return this.prismaService.wishList.create({
      data: {
        userId: userId,
      },
    });
  }
}
