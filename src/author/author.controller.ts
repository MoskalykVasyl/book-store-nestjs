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
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/createAuthor.dto';
import { UpdateAuthorDto } from './dto/updateAuthor.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.createAuthor(createAuthorDto);
  }

  @Get('get-all')
  @HttpCode(HttpStatus.OK)
  getAllAuthors() {
    return this.authorService.getAllAuthors();
  }

  @Get('by-id/:id')
  @HttpCode(HttpStatus.OK)
  getAuthor(@Param('id') id: string) {
    return this.authorService.getAuthorById(id);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteAuthor(@Param('id') id: string) {
    return this.authorService.deleteAuthor(id);
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  updateAuthor(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ) {
    console.log(updateAuthorDto);
    return this.authorService.updateAuthor(id, updateAuthorDto);
  }
}
