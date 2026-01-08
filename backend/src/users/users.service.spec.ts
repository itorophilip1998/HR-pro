import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const email = 'john@example.com';
      const password = 'password123';
      const name = 'John Doe';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockUser = {
        id: '1',
        email,
        password: hashedPassword,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(email, password, name);

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const name = 'John Doe';

      mockPrismaService.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      await expect(service.create(email, password, name)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user if password matches', async () => {
      const email = 'john@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';

      const mockUser = {
        id: '1',
        email,
        password: hashedPassword,
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({
        id: '1',
        email,
        name: 'John Doe',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password does not match', async () => {
      const email = 'john@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashedPassword123';

      const mockUser = {
        id: '1',
        email,
        password: hashedPassword,
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});

