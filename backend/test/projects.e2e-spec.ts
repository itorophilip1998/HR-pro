import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProjectStatus } from '../src/projects/enums/project-status.enum';

describe('Projects (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

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

    // Create a test user and get auth token
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = signupResponse.body.access_token;
    userId = signupResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('/projects (POST)', () => {
    it('should create a project', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          status: ProjectStatus.ACTIVE,
          deadline: '2024-12-31',
          assignedTeamMember: 'team@example.com',
          budget: 50000,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Project');
          expect(res.body.status).toBe(ProjectStatus.ACTIVE);
          expect(res.body.budget).toBe(50000);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .send({
          name: 'Test Project',
          status: ProjectStatus.ACTIVE,
          deadline: '2024-12-31',
          assignedTeamMember: 'team@example.com',
          budget: 50000,
        })
        .expect(401);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          status: 'INVALID',
          budget: -1000,
        })
        .expect(400);
    });
  });

  describe('/projects (GET)', () => {
    it('should get all projects', async () => {
      // Create a test project first
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project 2',
          status: ProjectStatus.ACTIVE,
          deadline: '2024-12-31',
          assignedTeamMember: 'team@example.com',
          budget: 60000,
        });

      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter projects by status', async () => {
      return request(app.getHttpServer())
        .get(`/projects?status=${ProjectStatus.ACTIVE}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((project: any) => {
            expect(project.status).toBe(ProjectStatus.ACTIVE);
          });
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/projects').expect(401);
    });
  });

  describe('/projects/:id (GET)', () => {
    let projectId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project for GET',
          status: ProjectStatus.ACTIVE,
          deadline: '2024-12-31',
          assignedTeamMember: 'team@example.com',
          budget: 70000,
        });
      projectId = response.body.id;
    });

    it('should get a project by id', () => {
      return request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(projectId);
          expect(res.body.name).toBe('Test Project for GET');
        });
    });

    it('should return 404 for non-existent project', () => {
      return request(app.getHttpServer())
        .get('/projects/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/projects/:id (PATCH)', () => {
    let projectId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project for PATCH',
          status: ProjectStatus.ACTIVE,
          deadline: '2024-12-31',
          assignedTeamMember: 'team@example.com',
          budget: 80000,
        });
      projectId = response.body.id;
    });

    it('should update a project', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Project Name',
          budget: 90000,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Project Name');
          expect(res.body.budget).toBe(90000);
        });
    });

    it('should return 404 for non-existent project', () => {
      return request(app.getHttpServer())
        .patch('/projects/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('/projects/:id (DELETE)', () => {
    let projectId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project for DELETE',
          status: ProjectStatus.ACTIVE,
          deadline: '2024-12-31',
          assignedTeamMember: 'team@example.com',
          budget: 100000,
        });
      projectId = response.body.id;
    });

    it('should delete a project', () => {
      return request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(projectId);
        });
    });

    it('should return 404 for non-existent project', () => {
      return request(app.getHttpServer())
        .delete('/projects/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

