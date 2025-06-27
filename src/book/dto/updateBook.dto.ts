import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Genre } from './createBook.dto';

export class UpdateBookDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @IsOptional()
  price?: number;

  @Min(1)
  @IsNotEmpty()
  @IsOptional()
  countPage?: number;

  @IsEnum(Genre, {
    message:
      'Gengre must be Fantasy, Mystery, Horror, RomanceNovel, Biography or Detective',
  })
  @IsOptional()
  genre?: Genre;

  @IsDateString()
  @IsOptional()
  publicYear?: Date;

  @IsString()
  @IsNotEmpty({ message: 'Book must have a description!' })
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Book must have a image' })
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  authorId?: string;
}
