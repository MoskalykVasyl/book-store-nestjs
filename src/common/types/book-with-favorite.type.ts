import { Prisma } from '@prisma/client';

export const includeAuthor = {
  author: true,
} satisfies Prisma.BookInclude;

export type BookWithAuthor = Prisma.BookGetPayload<{
  include: typeof includeAuthor;
}>;

export type BookWithFavorite = BookWithAuthor & { isFavorite: boolean };
