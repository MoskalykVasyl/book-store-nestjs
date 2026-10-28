import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedResult } from 'src/common/types/paginated-result.type';
import { CreateOrderDto } from './dto/createOrder.dto';
import { GetOrdersDto } from './dto/getOrders.dto';

const MAX_QUANTITY_PER_BOOK = 100;

// куди можна перевести замовлення з кожного статусу
const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

const includeItems = {
  items: true,
} satisfies Prisma.OrderInclude;

const includeItemsAndUser = {
  items: true,
  user: { select: { id: true, email: true, displayName: true } },
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof includeItems;
}>;

export type OrderWithItemsAndUser = Prisma.OrderGetPayload<{
  include: typeof includeItemsAndUser;
}>;

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderWithItems> {
    const { items, ...orderData } = createOrderDto;

    // одна книга могла прийти кількома рядками - об'єднуємо
    const quantities = new Map<string, number>();
    for (const { bookId, quantity } of items) {
      quantities.set(bookId, (quantities.get(bookId) ?? 0) + quantity);
    }

    for (const quantity of quantities.values()) {
      if (quantity > MAX_QUANTITY_PER_BOOK) {
        throw new BadRequestException(
          `Quantity of one book cannot exceed ${MAX_QUANTITY_PER_BOOK}!`,
        );
      }
    }

    const bookIds = [...quantities.keys()];
    const books = await this.prismaService.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true, price: true, genre: true },
    });

    if (books.length !== bookIds.length) {
      const foundIds = new Set(books.map((book) => book.id));
      const missingIds = bookIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Books not found: ${missingIds.join(', ')}`,
      );
    }

    // ціну беремо з бази, а не з корзини на фронтенді
    const orderItems = books.map((book) => ({
      bookId: book.id,
      title: book.title,
      genre: book.genre,
      unitPrice: book.price,
      quantity: quantities.get(book.id)!,
    }));

    const totalPrice = orderItems.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );

    return this.prismaService.order.create({
      data: {
        ...orderData,
        userId,
        totalPrice,
        items: { create: orderItems },
      },
      include: includeItems,
    });
  }

  async getUserOrders(
    userId: string,
    query: GetOrdersDto,
  ): Promise<PaginatedResult<OrderWithItems>> {
    const { page, limit, status } = query;
    const where: Prisma.OrderWhereInput = { userId, ...(status && { status }) };

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: includeItems,
      }),
      this.prismaService.order.count({ where }),
    ]);

    return this.paginate(items, total, page, limit);
  }

  async getUserOrderById(
    userId: string,
    orderId: string,
  ): Promise<OrderWithItems> {
    const order = await this.prismaService.order.findFirst({
      where: { id: orderId, userId },
      include: includeItems,
    });

    if (!order) {
      throw new NotFoundException('Order not found!');
    }

    return order;
  }

  async cancelUserOrder(
    userId: string,
    orderId: string,
  ): Promise<OrderWithItems> {
    const order = await this.getUserOrderById(userId, orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled!');
    }

    return this.changeStatus(order.id, order.status, OrderStatus.CANCELLED);
  }

  async getOrders(
    query: GetOrdersDto,
  ): Promise<PaginatedResult<OrderWithItemsAndUser>> {
    const { page, limit, status } = query;
    const where: Prisma.OrderWhereInput = status ? { status } : {};

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: includeItemsAndUser,
      }),
      this.prismaService.order.count({ where }),
    ]);

    return this.paginate(items, total, page, limit);
  }

  async getOrderById(orderId: string): Promise<OrderWithItemsAndUser> {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: includeItemsAndUser,
    });

    if (!order) {
      throw new NotFoundException('Order not found!');
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderWithItems> {
    const order = await this.getOrderById(orderId);

    if (!ALLOWED_STATUS_TRANSITIONS[order.status].includes(status)) {
      throw new BadRequestException(
        `Cannot change order status from ${order.status} to ${status}!`,
      );
    }

    return this.changeStatus(order.id, order.status, status);
  }

  // оновлюємо лише якщо статус не змінився з моменту перевірки
  private async changeStatus(
    orderId: string,
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): Promise<OrderWithItems> {
    const { count } = await this.prismaService.order.updateMany({
      where: { id: orderId, status: currentStatus },
      data: { status: newStatus },
    });

    if (count === 0) {
      throw new BadRequestException(
        'Order status has already been changed, please try again!',
      );
    }

    return this.prismaService.order.findUniqueOrThrow({
      where: { id: orderId },
      include: includeItems,
    });
  }

  private paginate<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}
