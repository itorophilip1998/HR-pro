import axios from "axios";
import {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectStatus,
} from "@/types/project";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export const getProjects = async (
  status?: ProjectStatus
): Promise<Project[]> => {
  const params = status ? { status } : {};
  const response = await api.get<Project[]>("/projects", { params });
  return response.data;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get<Project>(`/projects/${id}`);
  return response.data;
};

export const createProject = async (
  data: CreateProjectDto
): Promise<Project> => {
  const response = await api.post<Project>("/projects", data);
  return response.data;
};

export const updateProject = async (
  id: string,
  data: UpdateProjectDto
): Promise<Project> => {
  const response = await api.patch<Project>(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};

// Auth functions
export const signup = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

export const signin = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/signin", data);
  return response.data;
};
