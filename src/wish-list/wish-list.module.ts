import { Module } from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { WishListController } from './wish-list.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { BookService } from 'src/book/book.service';

@Module({
  imports: [AuthModule, BookService],
  controllers: [WishListController],
  providers: [WishListService, PrismaService],
})
export class WishListModule {}
