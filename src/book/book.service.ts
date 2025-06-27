import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';

@Injectable()
export class BookService {
  constructor(private prismaService: PrismaService) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    try {
      return this.prismaService.book.create({
        data: createBookDto,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to add book to store');
    }
  }

  async getAllBooks(): Promise<Book[]> {
    return this.prismaService.book.findMany({ include: { author: true } });
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
}
