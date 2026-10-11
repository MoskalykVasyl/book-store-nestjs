import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Book, Genre, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';

@Injectable()
export class BookService {
  private readonly includeAuthor = { author: true };

  constructor(private readonly prismaService: PrismaService) {}

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
    if (!userId || books.length === 0) {
      return books.map((book) => ({
        ...book,
        isFavorite: false,
      }));
    }

    const items = await this.prismaService.wishListItem.findMany({
      where: {
        userId,
        bookId: { in: books.map((book) => book.id) },
      },
      select: { bookId: true },
    });
    const favoriteIds = new Set(items.map((item) => item.bookId));

    return books.map((book) => ({
      ...book,
      isFavorite: favoriteIds.has(book.id),
    }));
  }

  async getBooksInWishList(
    userId: string,
  ): Promise<(Book & { isFavorite: boolean })[]> {
    const items = await this.prismaService.wishListItem.findMany({
      where: { userId },
      include: { book: { include: this.includeAuthor } },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      ...item.book,
      isFavorite: true,
    }));
  }

  async getBookById(id: string): Promise<Book> {
    const book = await this.prismaService.book.findUnique({
      where: { id },
      include: this.includeAuthor,
    });

    if (!book) {
      throw new NotFoundException('Book not found!');
    }

    return book;
  }

  async getListBooksByIds(ids: string[]): Promise<Book[]> {
    return this.prismaService.book.findMany({
      where: {
        id: { in: ids },
      },
      include: this.includeAuthor,
    });
  }

  async deleteBook(id: string) {
    try {
      return await this.prismaService.book.delete({ where: { id } });
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
      return await this.prismaService.book.update({
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
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return [];
    }

    return this.prismaService.book.findMany({
      where: {
        OR: [
          {
            title: {
              contains: trimmedKeyword,
              mode: 'insensitive',
            },
          },
          {
            author: {
              lastName: {
                contains: trimmedKeyword,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      include: this.includeAuthor,
      take: 5,
    });
  }

  async getBooksByGenre(
    genre: Genre,
    userId?: string,
  ): Promise<(Book & { isFavorite: boolean })[]> {
    const books = await this.prismaService.book.findMany({
      where: { genre },
      include: this.includeAuthor,
    });

    return this.addFavoriteField(books, userId);
  }
}
