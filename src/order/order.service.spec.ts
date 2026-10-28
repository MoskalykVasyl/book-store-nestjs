import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod } from '@prisma/client';

import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/createOrder.dto';

describe('OrderService', () => {
  let service: OrderService;

  const mockPrismaService = {
    book: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const orderData: Omit<CreateOrderDto, 'items'> = {
    fullName: 'John Doe',
    email: 'john@test.com',
    phone: '+380501234567',
    city: 'Kyiv',
    address: 'Khreshchatyk 1',
    paymentMethod: PaymentMethod.CARD,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should calculate total price from database prices and merge duplicates', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([
        { id: 'b1', title: 'Book 1', price: 100, genre: 'Fantasy' },
        { id: 'b2', title: 'Book 2', price: 50, genre: 'Horror' },
      ]);
      mockPrismaService.order.create.mockResolvedValue({ id: 'o1' });

      await service.createOrder('u1', {
        ...orderData,
        items: [
          { bookId: 'b1', quantity: 1 },
          { bookId: 'b2', quantity: 3 },
          { bookId: 'b1', quantity: 2 },
        ],
      });

      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          ...orderData,
          userId: 'u1',
          totalPrice: 450,
          items: {
            create: [
              {
                bookId: 'b1',
                title: 'Book 1',
                genre: 'Fantasy',
                unitPrice: 100,
                quantity: 3,
              },
              {
                bookId: 'b2',
                title: 'Book 2',
                genre: 'Horror',
                unitPrice: 50,
                quantity: 3,
              },
            ],
          },
        },
        include: { items: true },
      });
    });

    it('should throw BadRequestException when a book does not exist', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([
        { id: 'b1', title: 'Book 1', price: 100, genre: 'Fantasy' },
      ]);

      await expect(
        service.createOrder('u1', {
          ...orderData,
          items: [
            { bookId: 'b1', quantity: 1 },
            { bookId: 'missing', quantity: 1 },
          ],
        }),
      ).rejects.toThrow('Books not found: missing');

      expect(mockPrismaService.order.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when merged quantity is too big', async () => {
      await expect(
        service.createOrder('u1', {
          ...orderData,
          items: [
            { bookId: 'b1', quantity: 60 },
            { bookId: 'b1', quantity: 60 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.book.findMany).not.toHaveBeenCalled();
    });
  });

  describe('cancelUserOrder', () => {
    it('should cancel a pending order of the user', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue({
        id: 'o1',
        status: OrderStatus.PENDING,
      });
      mockPrismaService.order.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.findUniqueOrThrow.mockResolvedValue({
        id: 'o1',
        status: OrderStatus.CANCELLED,
      });

      const result = await service.cancelUserOrder('u1', 'o1');

      expect(mockPrismaService.order.findFirst).toHaveBeenCalledWith({
        where: { id: 'o1', userId: 'u1' },
        include: { items: true },
      });
      expect(mockPrismaService.order.updateMany).toHaveBeenCalledWith({
        where: { id: 'o1', status: OrderStatus.PENDING },
        data: { status: OrderStatus.CANCELLED },
      });
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should not cancel an order that is not pending', async () => {
      mockPrismaService.order.findFirst.mockResolvedValue({
        id: 'o1',
        status: OrderStatus.SHIPPED,
      });

      await expect(service.cancelUserOrder('u1', 'o1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.order.updateMany).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException for another user's order", async () => {
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.cancelUserOrder('u2', 'o1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should allow a valid status transition', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: OrderStatus.CONFIRMED,
      });
      mockPrismaService.order.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.findUniqueOrThrow.mockResolvedValue({
        id: 'o1',
        status: OrderStatus.SHIPPED,
      });

      const result = await service.updateOrderStatus('o1', OrderStatus.SHIPPED);

      expect(result.status).toBe(OrderStatus.SHIPPED);
    });

    it('should reject an invalid status transition', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: OrderStatus.DELIVERED,
      });

      await expect(
        service.updateOrderStatus('o1', OrderStatus.PENDING),
      ).rejects.toThrow(
        'Cannot change order status from DELIVERED to PENDING!',
      );
      expect(mockPrismaService.order.updateMany).not.toHaveBeenCalled();
    });

    it('should throw when status was changed concurrently', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'o1',
        status: OrderStatus.PENDING,
      });
      mockPrismaService.order.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.updateOrderStatus('o1', OrderStatus.CONFIRMED),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
