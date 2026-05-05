import apiClient from "./client";
import type { Project, ProjectFilterParams } from "@/types";

export const getProjects = async (params?: ProjectFilterParams) => {
  const response = await apiClient.get<Project[]>("/projects", { params });
  return response.data;
};

export const getProjectById = async (id: number) => {
  const response = await apiClient.get<Project>(`/projects/${id}`);
  return response.data;
};

export const createProject = async (project: Omit<Project, "id">) => {
  const response = await apiClient.post<Project>("/projects", project);
  return response.data;
};

export const updateProject = async (id: number, project: Partial<Project>) => {
  const response = await apiClient.put<Project>(`/projects/${id}`, project);
  return response.data;
};

export const deleteProject = async (id: number) => {
  await apiClient.delete(`/projects/${id}`);
};

export const addEmployeeToProject = async (projectId: number, employeeId: number) => {
  await apiClient.post(`/projects/${projectId}/employees/${employeeId}`);
};

export const removeEmployeeFromProject = async (projectId: number, employeeId: number) => {
  await apiClient.delete(`/projects/${projectId}/employees/${employeeId}`);
};

export const uploadProjectDocument = async (projectId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(`/projects/${projectId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProjectDocument = async (projectId: number, documentId: number) => {
  await apiClient.delete(`/projects/${projectId}/documents/${documentId}`);
};
