export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  deadline: string;
  assignedTeamMember: string;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  status: ProjectStatus;
  deadline: string;
  assignedTeamMember: string;
  budget: number;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

