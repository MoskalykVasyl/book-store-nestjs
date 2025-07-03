import { Genre } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class GetBooksByGenreDto {
  @IsEnum(Genre, { message: 'This genre does not use!' })
  genre: Genre;
}
