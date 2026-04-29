import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { WishListService } from 'src/wish-list/wish-list.service';

@Module({
  imports: [AuthModule],
  controllers: [BookController],
  providers: [BookService, PrismaService, WishListService],
  exports: [BookService],
})
export class BookModule {}
