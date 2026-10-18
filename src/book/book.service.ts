import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
import { GetBooksDto } from './dto/getBooks.dto';
import { PaginatedResult } from 'src/common/types/paginated-result.type';
import {
  BookWithFavorite,
  BookWithAuthor,
  includeAuthor,
} from 'src/common/types/book-with-favorite.type';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    return this.prismaService.book.create({
      data: createBookDto,
    });
  }

  async getBooks(
    query: GetBooksDto,
    userId?: string,
  ): Promise<PaginatedResult<BookWithFavorite>> {
    const { page, limit, genre } = query;
    const where: Prisma.BookWhereInput = genre ? { genre } : {};

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: includeAuthor,
      }),
      this.prismaService.book.count({ where }),
    ]);

    const booksWithFavorite = await this.addFavoriteField(items, userId);

    return {
      items: booksWithFavorite,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  private async addFavoriteField(
    books: BookWithAuthor[],
    userId?: string,
  ): Promise<BookWithFavorite[]> {
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

  async getBooksInWishList(userId: string): Promise<BookWithFavorite[]> {
    const items = await this.prismaService.wishListItem.findMany({
      where: { userId },
      include: { book: { include: includeAuthor } },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      ...item.book,
      isFavorite: true,
    }));
  }

  async getBookById(id: string): Promise<BookWithAuthor> {
    const book = await this.prismaService.book.findUnique({
      where: { id },
      include: includeAuthor,
    });

    if (!book) {
      throw new NotFoundException('Book not found!');
    }

    return book;
  }

  async getListBooksByIds(ids: string[]): Promise<BookWithAuthor[]> {
    return this.prismaService.book.findMany({
      where: {
        id: { in: ids },
      },
      include: includeAuthor,
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

  async searchBooks(keyword: string): Promise<BookWithAuthor[]> {
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
      include: includeAuthor,
      take: 5,
    });
  }
}
