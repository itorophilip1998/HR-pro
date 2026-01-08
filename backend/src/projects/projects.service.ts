import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from './enums/project-status.enum';
import { EmailService } from '../email/email.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async create(createProjectDto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        deadline: new Date(createProjectDto.deadline),
      },
    });

    // Send email if assignedTeamMember is an email address
    if (this.isValidEmail(createProjectDto.assignedTeamMember)) {
      await this.emailService.sendProjectAssignmentEmail(
        createProjectDto.assignedTeamMember,
        project.name,
        project.deadline.toISOString(),
        project.budget,
      );
    }

    return project;
  }

  async findAll(status?: ProjectStatus) {
    const where = status ? { status } : {};
    return this.prisma.project.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const existingProject = await this.findOne(id); // Check if project exists

    const updateData: any = { ...updateProjectDto };
    if (updateProjectDto.deadline) {
      updateData.deadline = new Date(updateProjectDto.deadline);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateData,
    });

    // Send email if team member changed and is an email address
    if (
      updateProjectDto.assignedTeamMember &&
      updateProjectDto.assignedTeamMember !== existingProject.assignedTeamMember &&
      this.isValidEmail(updateProjectDto.assignedTeamMember)
    ) {
      await this.emailService.sendProjectAssignmentEmail(
        updateProjectDto.assignedTeamMember,
        updatedProject.name,
        updatedProject.deadline.toISOString(),
        updatedProject.budget,
      );
    }

    return updatedProject;
  }

  async remove(id: string) {
    await this.findOne(id); // Check if project exists

    return this.prisma.project.delete({
      where: { id },
    });
  }
}

