import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
import { GetBooksByGenreDto } from './dto/getBooksByGenre.dto';

@Injectable()
export class BookService {
  private readonly includeAuthor = { author: true };
  constructor(private prismaService: PrismaService) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    return this.prismaService.book.create({
      data: createBookDto,
    });
  }

  async getAllBooks(): Promise<Book[]> {
    return this.prismaService.book.findMany({ include: this.includeAuthor });
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

  async getBooksByGenre(data: GetBooksByGenreDto): Promise<Book[]> {
    const bookList = await this.prismaService.book.findMany({
      where: {
        genre: { equals: data.genre },
      },
    });

    if (bookList.length === 0) {
      throw new NotFoundException('This genre have not books yet');
    }
    return bookList;
  }
}
