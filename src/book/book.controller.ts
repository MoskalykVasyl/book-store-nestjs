import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from '@prisma/client';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { OptionalJwtAuthGuard } from 'src/auth/guard/optional-jwt-auth.guard';
import { GetBooksDto } from './dto/getBooks.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createBook(@Body() createBookDto: CreateBookDto) {
    return this.bookService.createBook(createBookDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wish-list')
  @HttpCode(HttpStatus.OK)
  getBooksInWishList(@CurrentUser('id') userId: string) {
    return this.bookService.getBooksInWishList(userId);
  }

  @Get('by-id/:id')
  @HttpCode(HttpStatus.OK)
  getBook(@Param('id') id: string) {
    return this.bookService.getBookById(id);
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    console.log(updateBookDto);
    return this.bookService.updateBook(id, updateBookDto);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  searchBooks(@Query('keyword') keyword: string) {
    return this.bookService.searchBooks(keyword);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  getBooks(@Query() query: GetBooksDto, @CurrentUser('id') userId?: string) {
    return this.bookService.getBooks(query, userId);
  }
}
