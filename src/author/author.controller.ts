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
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { UpdateAuthorDto } from './dto/updateAuthor.dto';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.createAuthor(createAuthorDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllAuthors() {
    return this.authorService.getAllAuthors();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getAuthor(@Param('id') id: string) {
    return this.authorService.getAuthorById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteAuthor(@Param('id') id: string) {
    return this.authorService.deleteAuthor(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateAuthor(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    console.log(updateAuthorDto);
    return this.authorService.updateAuthor(id, updateAuthorDto);
  }
}
