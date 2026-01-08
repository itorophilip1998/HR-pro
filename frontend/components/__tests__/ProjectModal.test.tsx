import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectModal from '../ProjectModal';
import { Project, ProjectStatus } from '@/types/project';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  status: ProjectStatus.ACTIVE,
  deadline: '2024-12-31T00:00:00.000Z',
  assignedTeamMember: 'John Doe',
  budget: 50000,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

describe('ProjectModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ProjectModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.queryByText(/project/i)).not.toBeInTheDocument();
  });

  it('renders create project form when project is not provided', () => {
    render(
      <ProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    expect(screen.getByText(/create project/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter project name/i)).toBeInTheDocument();
  });

  it('renders edit project form when project is provided', () => {
    render(
      <ProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        project={mockProject}
      />,
    );
    expect(screen.getByText(/edit project/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    (api.createProject as jest.Mock).mockResolvedValue(mockProject);

    render(
      <ProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createProject).not.toHaveBeenCalled();
    });
  });

  it('creates a project with valid data', async () => {
    (api.createProject as jest.Mock).mockResolvedValue(mockProject);

    render(
      <ProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/enter project name/i), {
      target: { value: 'New Project' },
    });
    fireEvent.change(screen.getByLabelText(/deadline/i), {
      target: { value: '2024-12-31' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter team member/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter budget/i), {
      target: { value: '50000' },
    });

    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createProject).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('updates a project with valid data', async () => {
    (api.updateProject as jest.Mock).mockResolvedValue({
      ...mockProject,
      name: 'Updated Project',
    });

    render(
      <ProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        project={mockProject}
      />,
    );

    fireEvent.change(screen.getByDisplayValue('Test Project'), {
      target: { value: 'Updated Project' },
    });

    const submitButton = screen.getByText('Update');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.updateProject).toHaveBeenCalledWith('1', {
        name: 'Updated Project',
        status: ProjectStatus.ACTIVE,
        deadline: '2024-12-31',
        assignedTeamMember: 'John Doe',
        budget: 50000,
      });
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});

