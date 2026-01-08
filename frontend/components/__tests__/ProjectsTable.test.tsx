import { render, screen } from '@testing-library/react';
import ProjectsTable from '../ProjectsTable';
import { Project, ProjectStatus } from '@/types/project';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Test Project 1',
    status: ProjectStatus.ACTIVE,
    deadline: '2024-12-31T00:00:00.000Z',
    assignedTeamMember: 'John Doe',
    budget: 50000,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Test Project 2',
    status: ProjectStatus.COMPLETED,
    deadline: '2024-11-30T00:00:00.000Z',
    assignedTeamMember: 'Jane Smith',
    budget: 75000,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

describe('ProjectsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no projects', () => {
    render(
      <ProjectsTable
        projects={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    expect(
      screen.getByText('No projects found. Create your first project to get started!'),
    ).toBeInTheDocument();
  });

  it('renders projects table with data', () => {
    render(
      <ProjectsTable
        projects={mockProjects}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays project status badges correctly', () => {
    render(
      <ProjectsTable
        projects={mockProjects}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('formats budget correctly', () => {
    render(
      <ProjectsTable
        projects={mockProjects}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('$75,000')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(
      <ProjectsTable
        projects={mockProjects}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    // Check that dates are rendered (format may vary by locale)
    const dateElements = screen.getAllByText(/12\/31\/2024|11\/30\/2024/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('renders edit and delete buttons for each project', () => {
    render(
      <ProjectsTable
        projects={mockProjects}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });
});

