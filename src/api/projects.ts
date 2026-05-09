import apiClient from "./client";
import type { Company, Employee, Project, ProjectFilterParams } from "@/types";

type ApiCompany = Partial<Company> & {
  Id?: number;
  Name?: string;
};

type ApiEmployee = Partial<Employee> & {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  Patronymic?: string;
  Email?: string;
};

type ApiProject = Partial<Project> & {
  Id?: number;
  Name?: string;
  CustomerCompany?: ApiCompany;
  CustomerCompanyId?: number;
  ExecutorCompany?: ApiCompany;
  ExecutorCompanyId?: number;
  StartDate?: string;
  EndDate?: string;
  Priority?: number;
  ProjectManager?: ApiEmployee;
  ProjectManagerId?: number;
  Employees?: ApiEmployee[];
};

const mapCompany = (company?: ApiCompany | null, fallbackId?: number): Company => ({
  id: company?.id ?? company?.Id ?? fallbackId ?? 0,
  name: company?.name ?? company?.Name ?? "Не указана",
});

const mapEmployee = (employee?: ApiEmployee | null, fallbackId?: number): Employee => ({
  id: employee?.id ?? employee?.Id ?? fallbackId ?? 0,
  firstName: employee?.firstName ?? employee?.FirstName ?? "",
  lastName: employee?.lastName ?? employee?.LastName ?? "",
  patronymic: employee?.patronymic ?? employee?.Patronymic ?? "",
  email: employee?.email ?? employee?.Email ?? "",
});

const mapProject = (project: ApiProject): Project => ({
  id: project.id ?? project.Id ?? 0,
  name: project.name ?? project.Name ?? "Без названия",
  customerCompany: mapCompany(project.customerCompany ?? project.CustomerCompany, project.CustomerCompanyId),
  executorCompany: mapCompany(project.executorCompany ?? project.ExecutorCompany, project.ExecutorCompanyId),
  startDate: project.startDate ?? project.StartDate ?? "",
  endDate: project.endDate ?? project.EndDate ?? "",
  priority: project.priority ?? project.Priority ?? 0,
  projectManager: mapEmployee(project.projectManager ?? project.ProjectManager, project.ProjectManagerId),
  employees: (project.employees ?? project.Employees ?? []).map((employee) => mapEmployee(employee)),
  documents: project.documents,
});

export const getProjects = async (params?: ProjectFilterParams) => {
  const response = await apiClient.get<ApiProject[]>("/projects", { params });
  return response.data.map(mapProject);
};

export const getProjectById = async (id: number) => {
  const response = await apiClient.get<ApiProject>(`/projects/${id}`);
  return mapProject(response.data);
};

export const createProject = async (project: Omit<Project, "id">) => {
  const response = await apiClient.post<ApiProject>("/projects", project);
  return mapProject(response.data);
};

export const updateProject = async (id: number, project: Partial<Project>) => {
  const response = await apiClient.put<ApiProject>(`/projects/${id}`, project);
  return mapProject(response.data);
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
