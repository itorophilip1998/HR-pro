import {
  signup,
  signin,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../api';
import { ProjectStatus } from '@/types/project';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a mock axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

mockedAxios.create = jest.fn(() => mockAxiosInstance as any);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  describe('signup', () => {
    it('should sign up a user successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await signup({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/signup', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('signin', () => {
    it('should sign in a user successfully', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await signin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/signin', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('getProjects', () => {
    it('should fetch all projects', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Project 1',
          status: ProjectStatus.ACTIVE,
          deadline: '2024-12-31',
          assignedTeamMember: 'John',
          budget: 50000,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockProjects });
      localStorageMock.setItem('token', 'mock-token');

      const result = await getProjects();

      expect(result).toEqual(mockProjects);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects', { params: {} });
    });

    it('should fetch projects with status filter', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Project 1',
          status: ProjectStatus.ACTIVE,
          deadline: '2024-12-31',
          assignedTeamMember: 'John',
          budget: 50000,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockProjects });
      localStorageMock.setItem('token', 'mock-token');

      const result = await getProjects(ProjectStatus.ACTIVE);

      expect(result).toEqual(mockProjects);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects', {
        params: { status: ProjectStatus.ACTIVE },
      });
    });
  });

  describe('getProject', () => {
    it('should fetch a single project', async () => {
      const mockProject = {
        id: '1',
        name: 'Project 1',
        status: ProjectStatus.ACTIVE,
        deadline: '2024-12-31',
        assignedTeamMember: 'John',
        budget: 50000,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockProject });
      localStorageMock.setItem('token', 'mock-token');

      const result = await getProject('1');

      expect(result).toEqual(mockProject);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/1');
    });
  });

  describe('createProject', () => {
    it('should create a project', async () => {
      const mockProject = {
        id: '1',
        name: 'New Project',
        status: ProjectStatus.ACTIVE,
        deadline: '2024-12-31',
        assignedTeamMember: 'John',
        budget: 50000,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockedAxios.post.mockResolvedValue({ data: mockProject });
      localStorageMock.setItem('token', 'mock-token');

      const result = await createProject({
        name: 'New Project',
        status: ProjectStatus.ACTIVE,
        deadline: '2024-12-31',
        assignedTeamMember: 'John',
        budget: 50000,
      });

      expect(result).toEqual(mockProject);
      expect(mockedAxios.post).toHaveBeenCalledWith('/projects', {
        name: 'New Project',
        status: ProjectStatus.ACTIVE,
        deadline: '2024-12-31',
        assignedTeamMember: 'John',
        budget: 50000,
      });
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const mockProject = {
        id: '1',
        name: 'Updated Project',
        status: ProjectStatus.COMPLETED,
        deadline: '2024-12-31',
        assignedTeamMember: 'John',
        budget: 60000,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      mockAxiosInstance.patch.mockResolvedValue({ data: mockProject });
      localStorageMock.setItem('token', 'mock-token');

      const result = await updateProject('1', {
        name: 'Updated Project',
        budget: 60000,
      });

      expect(result).toEqual(mockProject);
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/projects/1', {
        name: 'Updated Project',
        budget: 60000,
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const mockProject = {
        id: '1',
        name: 'Project to Delete',
        status: ProjectStatus.ACTIVE,
        deadline: '2024-12-31',
        assignedTeamMember: 'John',
        budget: 50000,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockAxiosInstance.delete.mockResolvedValue({ data: mockProject });
      localStorageMock.setItem('token', 'mock-token');

      const result = await deleteProject('1');

      expect(result).toEqual(mockProject);
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/projects/1');
    });
  });
});

