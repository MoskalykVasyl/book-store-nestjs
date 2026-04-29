import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Book } from '@prisma/client';
import { BookService } from 'src/book/book.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishListService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bookService: BookService,
  ) {}

  private async getOrCreateWishList(userId: string) {
    let wishList = await this.prismaService.wishList.findUnique({
      where: { userId },
    });

    if (!wishList) {
      wishList = await this.prismaService.wishList.create({
        data: {
          userId,
          bookIdList: [],
        },
      });
    }

    return wishList;
  }

  async addBook(bookId: string, userId: string) {
    const wishList = await this.getOrCreateWishList(userId);

    if (wishList.bookIdList.includes(bookId)) {
      throw new BadRequestException('Book already in wishlist');
    }

    return this.prismaService.wishList.update({
      where: { userId },
      data: {
        bookIdList: {
          push: bookId,
        },
      },
    });
  }

  async removeBook(bookId: string, userId: string) {
    const wishList = await this.prismaService.wishList.findUnique({
      where: { userId },
    });

    if (!wishList) {
      throw new NotFoundException('Wishlist not found');
    }

    if (!wishList.bookIdList.includes(bookId)) {
      throw new NotFoundException('Book not in wishlist');
    }

    const updatedList = wishList.bookIdList.filter((id) => id !== bookId);

    return this.prismaService.wishList.update({
      where: { userId },
      data: { bookIdList: updatedList },
    });
  }

  async getWishListByUserId(userId: string) {
    const wishList = await this.prismaService.wishList.findUnique({
      where: { userId },
    });

    if (!wishList) {
      throw new NotFoundException('Wish list not found');
    }
    const books = await this.getBooksInWishList(wishList.bookIdList);
    return books;
  }

  async getBooksInWishList(bookIdList: string[]): Promise<Book[]> {
    return await this.bookService.getListBooksByIds(bookIdList);
  }
}
