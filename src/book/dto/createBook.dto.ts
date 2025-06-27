import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export enum Genre {
  Fantasy = 'Fantasy',
  Mystery = 'Mystery',
  Horror = 'Horror',
  RomanceNovel = 'RomanceNovel',
  Biography = 'Biography',
  Detective = 'Detective',
}

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @Min(1)
  @IsNotEmpty()
  countPage: number;

  @IsEnum(Genre, {
    message:
      'Gengre must be Fantasy, Mystery, Horror, RomanceNovel, Biography or Detective',
  })
  genre: Genre;

  @IsDateString()
  publicYear: Date;

  @IsString()
  @IsNotEmpty({ message: 'Book must have a description!' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Book must have a image' })
  imageUrl: string;

  @IsString()
  authorId: string;
}
