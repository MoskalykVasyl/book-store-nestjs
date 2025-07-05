import { Injectable, NotFoundException } from '@nestjs/common';
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

  async removeBook(bookId: string, userId: string) {
    const wishList = await this.prismaService.wishList.findUnique({
      where: { userId: userId },
    });

    if (!wishList) {
      throw new NotFoundException('Wish list not found for this user!');
    }

    const updatedList = wishList.bookIdList.filter((id) => id !== bookId);

    return this.prismaService.wishList.update({
      where: { userId: userId },
      data: { bookIdList: updatedList },
    });
  }
}
