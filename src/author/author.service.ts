import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { Author, Prisma } from '@prisma/client';
import { UpdateAuthorDto } from './dto/updateAuthor.dto';

@Injectable()
export class AuthorService {
  constructor(private prismaService: PrismaService) {}

  async createAuthor(createAuthorDto: CreateAuthorDto): Promise<Author> {
    try {
      return this.prismaService.author.create({
        data: createAuthorDto,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to create new author');
    }
  }

  async getAllAuthors(): Promise<Author[]> {
    return this.prismaService.author.findMany();
  }

  async getAuthorById(id: string): Promise<Author> {
    const author = await this.prismaService.author.findUnique({
      where: { id },
    });
    if (!author) {
      throw new NotFoundException('Author not found!');
    }
    return author;
  }

  async deleteAuthor(id: string) {
    try {
      return this.prismaService.author.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Author with id:${id} not found!`);
      }
      throw new InternalServerErrorException('Failed to delete author');
    }
  }

  async updateAuthor(
    id: string,
    updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    try {
      return this.prismaService.author.update({
        where: { id },
        data: updateAuthorDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Author with ID ${id} not found.`);
      }
      throw new InternalServerErrorException('Failed to update author');
    }
  }
}
