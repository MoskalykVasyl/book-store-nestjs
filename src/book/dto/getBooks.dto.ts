import { Genre } from '@prisma/client';
import { Type, Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { genreMap } from '../constants/genre-map';

export class GetBooksDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string'
      ? (genreMap[value.toLowerCase()] ?? value)
      : value,
  )
  @IsEnum(Genre, { message: 'This genre does not use!' })
  genre?: Genre;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
