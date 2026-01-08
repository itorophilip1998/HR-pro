import { IsString, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { ProjectStatus } from '../enums/project-status.enum';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @IsDateString()
  deadline: string;

  @IsString()
  assignedTeamMember: string;

  @IsNumber()
  @Min(0)
  budget: number;
}

