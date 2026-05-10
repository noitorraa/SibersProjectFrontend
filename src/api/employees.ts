import apiClient from "./client";
import type { Employee } from "@/types";

type ApiEmployee = Partial<Employee> & {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  MiddleName?: string;
  Patronymic?: string;
  Email?: string;
};

type EmployeesEnvelope = {
  items?: ApiEmployee[];
  data?: ApiEmployee[];
  results?: ApiEmployee[];
  Items?: ApiEmployee[];
  Data?: ApiEmployee[];
  Results?: ApiEmployee[];
  $values?: ApiEmployee[];
  value?: ApiEmployee[];
  Value?: ApiEmployee[];
};
type EmployeesResponse = ApiEmployee[] | EmployeesEnvelope;

const mapEmployee = (employee: ApiEmployee): Employee => ({
  id: employee.id ?? employee.Id ?? 0,
  firstName: employee.firstName ?? employee.FirstName ?? "",
  lastName: employee.lastName ?? employee.LastName ?? "",
  patronymic: employee.patronymic ?? employee.Patronymic ?? employee.MiddleName ?? "",
  email: employee.email ?? employee.Email ?? "",
});

const extractEmployees = (payload: EmployeesResponse): ApiEmployee[] => {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.Items ?? payload.data ?? payload.Data ?? payload.results ?? payload.Results ?? payload.$values ?? payload.value ?? payload.Value ?? [];
};

export const getEmployees = async () => {
  const response = await apiClient.get<EmployeesResponse>("/Employees");
  return extractEmployees(response.data).map(mapEmployee);
};

export const getEmployeeById = async (id: number) => {
  const response = await apiClient.get<ApiEmployee>(`/Employees/${id}`);
  return mapEmployee(response.data);
};

export const createEmployee = async (project: Omit<Employee, "id">) => {
  const response = await apiClient.post<ApiEmployee>("/Employees", project);
  return mapEmployee(response.data);
};

export const updateEmployee = async (id: number, project: Partial<Employee>) => {
  const payload = { id, Id: id, ...project };
  const response = await apiClient.put<ApiEmployee | null>(`/Employees/${id}`, payload);
  if (response.data && Object.keys(response.data).length) {
    return mapEmployee(response.data);
  }
  return {
    id,
    firstName: project.firstName ?? "",
    lastName: project.lastName ?? "",
    patronymic: project.patronymic ?? "",
    email: project.email ?? "",
  };
};

export const deleteEmployee = async (id: number) => {
  await apiClient.delete(`/Employees/${id}`);
};

export const searchEmployees = async (query: string) => {
  const response = await apiClient.get<EmployeesResponse>("/Employees/search", { params: { query } });
  return extractEmployees(response.data).map(mapEmployee);
};

export const getEmployeesByProject = async (projectId: number) => {
  const response = await apiClient.get<EmployeesResponse>(`/Employees/by-project/${projectId}`);
  return extractEmployees(response.data).map(mapEmployee);
};
