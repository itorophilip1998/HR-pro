import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('john@example.com');
          expect(res.body.user.name).toBe('John Doe');
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        });

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Jane Doe 2',
          email: 'jane@example.com',
          password: 'password456',
        })
        .expect(409);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should fail with missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/auth/signin (POST)', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Signin Test User',
          email: 'signin@example.com',
          password: 'password123',
        });
    });

    it('should sign in with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('signin@example.com');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'signin@example.com',
        })
        .expect(400);
    });
  });
});

