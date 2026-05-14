import { Genre } from '@prisma/client';

export const genreMap: Record<string, Genre> = {
  fantasy: Genre.Fantasy,
  mystery: Genre.Mystery,
  horror: Genre.Horror,
  romancenovel: Genre.RomanceNovel,
  biography: Genre.Biography,
  detective: Genre.Detective,
};
