import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { BookModule } from './book/book.module';
import { AuthorModule } from './author/author.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WishListModule } from './wish-list/wish-list.module';

@Module({
  imports: [BookModule, AuthorModule, FileUploadModule, UserModule, AuthModule, WishListModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
