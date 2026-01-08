import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from './enums/project-status.enum';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prismaService: PrismaService;
  let emailService: EmailService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockEmailService = {
    sendProjectAssignmentEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project successfully', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        status: ProjectStatus.ACTIVE,
        deadline: '2024-12-31',
        assignedTeamMember: 'John Doe',
        budget: 50000,
      };

      const mockProject = {
        id: '1',
        ...createProjectDto,
        deadline: new Date(createProjectDto.deadline),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.create.mockResolvedValue(mockProject);

      const result = await service.create(createProjectDto);

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.create).toHaveBeenCalledWith({
        data: {
          ...createProjectDto,
          deadline: new Date(createProjectDto.deadline),
        },
      });
      expect(mockEmailService.sendProjectAssignmentEmail).not.toHaveBeenCalled();
    });

    it('should send email when assignedTeamMember is an email', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        status: ProjectStatus.ACTIVE,
        deadline: '2024-12-31',
        assignedTeamMember: 'team@example.com',
        budget: 50000,
      };

      const mockProject = {
        id: '1',
        ...createProjectDto,
        deadline: new Date(createProjectDto.deadline),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.create.mockResolvedValue(mockProject);
      mockEmailService.sendProjectAssignmentEmail.mockResolvedValue(undefined);

      const result = await service.create(createProjectDto);

      expect(result).toEqual(mockProject);
      expect(mockEmailService.sendProjectAssignmentEmail).toHaveBeenCalledWith(
        'team@example.com',
        mockProject.name,
        mockProject.deadline.toISOString(),
        mockProject.budget,
      );
    });
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Project 1',
          status: ProjectStatus.ACTIVE,
          deadline: new Date(),
          assignedTeamMember: 'John',
          budget: 50000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll();

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter projects by status', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Project 1',
          status: ProjectStatus.ACTIVE,
          deadline: new Date(),
          assignedTeamMember: 'John',
          budget: 50000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      const result = await service.findAll(ProjectStatus.ACTIVE);

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith({
        where: { status: ProjectStatus.ACTIVE },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      const mockProject = {
        id: '1',
        name: 'Test Project',
        status: ProjectStatus.ACTIVE,
        deadline: new Date(),
        assignedTeamMember: 'John',
        budget: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a project successfully', async () => {
      const existingProject = {
        id: '1',
        name: 'Old Name',
        status: ProjectStatus.ACTIVE,
        deadline: new Date(),
        assignedTeamMember: 'John',
        budget: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto: UpdateProjectDto = {
        name: 'New Name',
        budget: 60000,
      };

      const updatedProject = {
        ...existingProject,
        ...updateDto,
        updatedAt: new Date(),
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedProject);
      expect(mockPrismaService.project.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should send email when team member changes to email', async () => {
      const existingProject = {
        id: '1',
        name: 'Test Project',
        status: ProjectStatus.ACTIVE,
        deadline: new Date('2024-12-31'),
        assignedTeamMember: 'old@example.com',
        budget: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto: UpdateProjectDto = {
        assignedTeamMember: 'new@example.com',
      };

      const updatedProject = {
        ...existingProject,
        ...updateDto,
        updatedAt: new Date(),
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);
      mockEmailService.sendProjectAssignmentEmail.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedProject);
      expect(mockEmailService.sendProjectAssignmentEmail).toHaveBeenCalledWith(
        'new@example.com',
        updatedProject.name,
        updatedProject.deadline.toISOString(),
        updatedProject.budget,
      );
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a project successfully', async () => {
      const mockProject = {
        id: '1',
        name: 'Test Project',
        status: ProjectStatus.ACTIVE,
        deadline: new Date(),
        assignedTeamMember: 'John',
        budget: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.project.delete.mockResolvedValue(mockProject);

      const result = await service.remove('1');

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.project.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});

