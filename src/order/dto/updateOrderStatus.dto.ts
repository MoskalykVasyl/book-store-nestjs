import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'This order status does not exist!' })
  status: OrderStatus;
}
