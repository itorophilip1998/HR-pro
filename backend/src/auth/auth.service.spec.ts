import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a user and return access token', async () => {
      const signupDto: SignupDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock-jwt-token';

      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });

      expect(mockUsersService.create).toHaveBeenCalledWith(
        signupDto.email,
        signupDto.password,
        signupDto.name,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
    });
  });

  describe('signin', () => {
    it('should return access token for valid credentials', async () => {
      const signinDto: SigninDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const mockToken = 'mock-jwt-token';

      mockUsersService.validateUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.signin(signinDto);

      expect(result).toEqual({
        access_token: mockToken,
        user: mockUser,
      });

      expect(mockUsersService.validateUser).toHaveBeenCalledWith(
        signinDto.email,
        signinDto.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const signinDto: SigninDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.validateUser.mockResolvedValue(null);

      await expect(service.signin(signinDto)).rejects.toThrow(UnauthorizedException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });
});

