import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Book, Genre, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
import { WishListService } from 'src/wish-list/wish-list.service';

@Injectable()
export class BookService {
  private readonly includeAuthor = { author: true };
  constructor(
    private prismaService: PrismaService,
    private wishListService: WishListService,
  ) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    return this.prismaService.book.create({
      data: createBookDto,
    });
  }

  async getAllBooks(
    userId?: string,
  ): Promise<(Book & { isFavorite: boolean })[]> {
    const bookList = await this.prismaService.book.findMany({
      include: this.includeAuthor,
    });

    return this.addFavoriteField(bookList, userId);
  }

  async getBooks(genre?: Genre, userId?: string) {
    if (!genre) {
      return this.getAllBooks(userId);
    }

    return this.getBooksByGenre(genre, userId);
  }

  private async addFavoriteField(
    books: Book[],
    userId?: string,
  ): Promise<(Book & { isFavorite: boolean })[]> {
    if (!userId) {
      return books.map((book) => ({
        ...book,
        isFavorite: false,
      }));
    }

    const wishList = await this.wishListService.getWishListByUserId(userId);
    const favoriteIds = new Set(wishList.bookIdList);

    return books.map((book) => ({
      ...book,
      isFavorite: favoriteIds.has(book.id),
    }));
  }

  async getBooksInWishList(
    userId: string,
  ): Promise<(Book & { isFavorite: boolean })[]> {
    const wishList = await this.wishListService.getWishListByUserId(userId);
    const books = await this.prismaService.book.findMany({
      where: {
        id: {
          in: wishList.bookIdList,
        },
      },
      include: { author: true },
    });
    return books.map((book) => ({
      ...book,
      isFavorite: true,
    }));
  }

  async getBookById(id: string): Promise<Book> {
    const book = await this.prismaService.book.findUnique({
      where: { id },
      include: { author: true },
    });
    if (!book) {
      throw new NotFoundException('Book not found!');
    }
    return book;
  }

  async getListBooksByIds(ids: string[]): Promise<Book[]> {
    return this.prismaService.book.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        author: true,
      },
    });
  }

  async deleteBook(id: string) {
    try {
      return this.prismaService.book.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Book with id:${id} not found!`);
      }
      throw new InternalServerErrorException('Failed to delete book');
    }
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      return this.prismaService.book.update({
        where: { id },
        data: updateBookDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Book with ID ${id} not found.`);
      }
      throw new InternalServerErrorException('Failed to update book');
    }
  }

  async searchBooks(keyword: string): Promise<Book[]> {
    const bookList = await this.prismaService.book.findMany({
      where: {
        title: { contains: keyword, mode: 'insensitive' },
      },
    });
    if (bookList.length === 0) {
      throw new NotFoundException('No books found for the given keyword');
    }
    return bookList;
  }

  async getBooksByGenre(genre: Genre, userId?: string): Promise<Book[]> {
    const books = await this.prismaService.book.findMany({
      where: {
        genre,
      },
      include: this.includeAuthor,
    });

    return this.addFavoriteField(books, userId);
  }
}
