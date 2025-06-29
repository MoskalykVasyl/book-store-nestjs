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
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createBook(@Body() createBookDto: CreateBookDto) {
    return this.bookService.createBook(createBookDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllBooks() {
    return this.bookService.getAllBooks();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getBook(@Param('id') id: string) {
    return this.bookService.getBookById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    console.log(updateBookDto);
    return this.bookService.updateBook(id, updateBookDto);
  }
}
