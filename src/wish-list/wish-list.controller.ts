import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('wish-list')
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

  @UseGuards(JwtAuthGuard)
  @Put('add-book')
  addBook(@Body('bookId') bookId: string, @CurrentUser('id') userId: string) {
    return this.wishListService.addBook(bookId, userId);
  }
}
