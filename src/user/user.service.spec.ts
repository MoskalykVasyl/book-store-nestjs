import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const fakeUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
      };

      prisma.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.findByEmail('test@test.com');

      expect(result).toEqual(fakeUser);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'test@test.com',
        },
      });
    });

    it('should return null when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@test.com');

      expect(result).toBeNull();

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'unknown@test.com',
        },
      });
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const fakeUser = {
        id: '1',
        email: 'test@test.com',
      };

      prisma.user.findUnique.mockResolvedValue(fakeUser);

      const result = await service.findById('1');

      expect(result).toEqual(fakeUser);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);

      await expect(service.findById('999')).rejects.toThrow('User not found!');
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const createUserDto = {
        email: 'test@test.com',
        password: 'hashed',
        displayName: 'Test User',
      };

      const fakeUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
        displayName: 'Test User',
      };

      prisma.user.create.mockResolvedValue(fakeUser);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(fakeUser);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      const fakeUser = {
        id: '1',
        email: 'test@test.com',
        refreshToken: null,
      };

      prisma.user.findUnique.mockResolvedValue(fakeUser);
      prisma.user.update.mockResolvedValue({
        ...fakeUser,
        refreshToken: 'new-refresh-token',
      });

      await service.updateRefreshToken('1', 'new-refresh-token');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: {
          refreshToken: 'new-refresh-token',
        },
      });
    });

    it('should remove refresh token when null is provided', async () => {
      const fakeUser = {
        id: '1',
        email: 'test@test.com',
        refreshToken: 'old-refresh-token',
      };

      prisma.user.findUnique.mockResolvedValue(fakeUser);

      prisma.user.update.mockResolvedValue({
        ...fakeUser,
        refreshToken: null,
      });

      await service.updateRefreshToken('1', null);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: {
          refreshToken: null,
        },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateRefreshToken('999', 'new-refresh-token'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.updateRefreshToken('999', 'new-refresh-token'),
      ).rejects.toThrow('User not found!');

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
