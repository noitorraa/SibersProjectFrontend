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
  MiddleName?: string;
  Email?: string;
};

type ApiProject = Partial<Project> & {
  Documents?: Project["documents"];
  Id?: number;
  Name?: string;
  customerCompanyId?: number;
  customerCompanyName?: string;
  contractorCompany?: ApiCompany;
  contractorCompanyId?: number;
  contractorCompanyName?: string;
  executorCompany?: ApiCompany;
  executorCompanyId?: number;
  executorCompanyName?: string;
  projectManager?: ApiEmployee;
  projectManagerId?: number;
  manager?: ApiEmployee;
  managerId?: number;
  CustomerCompany?: ApiCompany;
  CustomerCompanyId?: number;
  CustomerCompanyName?: string;
  ContractorCompany?: ApiCompany;
  ContractorCompanyId?: number;
  ContractorCompanyName?: string;
  ExecutorCompany?: ApiCompany;
  ExecutorCompanyId?: number;
  ExecutorCompanyName?: string;
  StartDate?: string;
  EndDate?: string;
  Priority?: number;
  ProjectManager?: ApiEmployee;
  ProjectManagerId?: number;
  Manager?: ApiEmployee;
  ManagerId?: number;
  Employees?: ApiEmployee[];
};


type ProjectWriteDto = {
  name?: string;
  startDate?: string;
  endDate?: string;
  priority?: number;
  customerCompanyId?: number;
  contractorCompanyId?: number;
  managerId?: number;
};

const toProjectWriteDto = (project: Partial<Project>): ProjectWriteDto => ({
  name: project.name,
  startDate: project.startDate,
  endDate: project.endDate,
  priority: project.priority,
  customerCompanyId: project.customerCompany?.id,
  contractorCompanyId: project.executorCompany?.id,
  managerId: project.projectManager?.id,
});
const mapCompany = (company?: ApiCompany | null, fallbackId?: number, fallbackName?: string): Company => ({
  id: Number(company?.id ?? company?.Id ?? fallbackId ?? 0),
  name: company?.name ?? company?.Name ?? fallbackName ?? "Не указана",
});

const mapEmployee = (employee?: ApiEmployee | null, fallbackId?: number): Employee => ({
  id: Number(employee?.id ?? employee?.Id ?? fallbackId ?? 0),
  firstName: employee?.firstName ?? employee?.FirstName ?? "",
  lastName: employee?.lastName ?? employee?.LastName ?? "",
  patronymic: employee?.patronymic ?? employee?.Patronymic ?? employee?.MiddleName ?? "",
  email: employee?.email ?? employee?.Email ?? "",
});

const mapProject = (project: ApiProject): Project => ({
  id: Number(project.id ?? project.Id ?? 0),
  name: project.name ?? project.Name ?? "Без названия",
  customerCompany: mapCompany(
    project.customerCompany ?? project.CustomerCompany,
    project.customerCompanyId ?? project.CustomerCompanyId,
    project.customerCompanyName ?? project.CustomerCompanyName,
  ),
  executorCompany: mapCompany(
    project.executorCompany ?? project.ExecutorCompany ?? project.ContractorCompany,
    project.executorCompanyId ?? project.ExecutorCompanyId ?? project.contractorCompanyId ?? project.ContractorCompanyId,
    project.executorCompanyName ?? project.ExecutorCompanyName ?? project.contractorCompanyName ?? project.ContractorCompanyName,
  ),
  startDate: project.startDate ?? project.StartDate ?? "",
  endDate: project.endDate ?? project.EndDate ?? "",
  priority: Number(project.priority ?? project.Priority ?? 0),
  projectManager: mapEmployee(
    project.projectManager ?? project.ProjectManager ?? project.manager ?? project.Manager,
    project.projectManagerId ?? project.ProjectManagerId ?? project.managerId ?? project.ManagerId,
  ),
  employees: (project.employees ?? project.Employees ?? []).map((employee) => mapEmployee(employee)),
  documents: project.documents ?? project.Documents,
});

type ProjectsListEnvelope = {
  items?: ApiProject[];
  Items?: ApiProject[];
  data?: ApiProject[];
  Data?: ApiProject[];
  results?: ApiProject[];
  Results?: ApiProject[];
  $values?: ApiProject[];
  value?: ApiProject[];
  Value?: ApiProject[];
};
type ProjectsListResponse = ApiProject[] | ProjectsListEnvelope;

type ProjectSingleEnvelope = {
  project?: ApiProject;
  Project?: ApiProject;
  item?: ApiProject;
  Item?: ApiProject;
  data?: ApiProject;
  Data?: ApiProject;
  value?: ApiProject;
  Value?: ApiProject;
};

const extractProjects = (payload: ProjectsListResponse): ApiProject[] => {
  if (Array.isArray(payload)) return payload;

  return payload.items ?? payload.Items ?? payload.data ?? payload.Data ?? payload.results ?? payload.Results ?? payload.$values ?? payload.value ?? payload.Value ?? [];
};


const extractSingleProject = (payload: ApiProject | ProjectSingleEnvelope): ApiProject => {
  if ("id" in payload || "Id" in payload || "name" in payload || "Name" in payload) {
    return payload as ApiProject;
  }

  const envelope = payload as ProjectSingleEnvelope;
  return envelope.project ?? envelope.Project ?? envelope.item ?? envelope.Item ?? envelope.data ?? envelope.Data ?? envelope.value ?? envelope.Value ?? {};
};

export const getProjects = async (params?: ProjectFilterParams) => {
  const queryParams = { ...params } as ProjectFilterParams & { managerId?: number };
  if (queryParams.projectManagerId && !queryParams.managerId) {
    queryParams.managerId = queryParams.projectManagerId;
  }

  const response = await apiClient.get<ProjectsListResponse>("/Projects", { params: queryParams });
  return extractProjects(response.data).map(mapProject);
};

export const getProjectById = async (id: number) => {
  const response = await apiClient.get<ApiProject>(`/Projects/${id}`);
  return mapProject(extractSingleProject(response.data));
};

export const createProject = async (project: Omit<Project, "id">) => {
  const response = await apiClient.post<ApiProject>("/Projects", toProjectWriteDto(project));
  return mapProject(extractSingleProject(response.data));
};

export const updateProject = async (id: number, project: Partial<Project>) => {
  const response = await apiClient.put<ApiProject>(`/Projects/${id}`, toProjectWriteDto(project));
  return mapProject(extractSingleProject(response.data));
};

export const deleteProject = async (id: number) => {
  await apiClient.delete(`/Projects/${id}`);
};

export const addEmployeeToProject = async (projectId: number, employeeId: number) => {
  await apiClient.post(`/Projects/${projectId}/employees/${employeeId}`);
};

export const removeEmployeeFromProject = async (projectId: number, employeeId: number) => {
  await apiClient.delete(`/Projects/${projectId}/employees/${employeeId}`);
};

export const uploadProjectDocument = async (projectId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(`/Projects/${projectId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProjectDocument = async (projectId: number, documentId: number) => {
  await apiClient.delete(`/Projects/${projectId}/documents/${documentId}`);
};
