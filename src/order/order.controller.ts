import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { CurrentUser } from 'src/auth/decorators/current-user.decorators';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { GetOrdersDto } from './dto/getOrders.dto';
import { UpdateOrderStatusDto } from './dto/updateOrderStatus.dto';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createOrder(
    @CurrentUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  getMyOrders(@CurrentUser('id') userId: string, @Query() query: GetOrdersDto) {
    return this.orderService.getUserOrders(userId, query);
  }

  @Get('my/:id')
  @HttpCode(HttpStatus.OK)
  getMyOrder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderService.getUserOrderById(userId, id);
  }

  @Patch('my/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelMyOrder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orderService.cancelUserOrder(userId, id);
  }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  getOrders(@Query() query: GetOrdersDto) {
    return this.orderService.getOrders(query);
  }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.getOrderById(id);
  }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, updateOrderStatusDto.status);
  }
}
