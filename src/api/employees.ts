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

type EmployeesResponse = ApiEmployee[] | { items?: ApiEmployee[]; data?: ApiEmployee[]; results?: ApiEmployee[]; Items?: ApiEmployee[]; Data?: ApiEmployee[]; Results?: ApiEmployee[] };

const mapEmployee = (employee: ApiEmployee): Employee => ({
  id: employee.id ?? employee.Id ?? 0,
  firstName: employee.firstName ?? employee.FirstName ?? "",
  lastName: employee.lastName ?? employee.LastName ?? "",
  patronymic: employee.patronymic ?? employee.Patronymic ?? employee.MiddleName ?? "",
  email: employee.email ?? employee.Email ?? "",
});

const extractEmployees = (payload: EmployeesResponse): ApiEmployee[] => {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.Items ?? payload.data ?? payload.Data ?? payload.results ?? payload.Results ?? (payload as any).$values ?? (payload as any).value ?? (payload as any).Value ?? [];
};

export const getEmployees = async () => {
  const response = await apiClient.get<EmployeesResponse>("/employees");
  return extractEmployees(response.data).map(mapEmployee);
};

export const getEmployeeById = async (id: number) => {
  const response = await apiClient.get<ApiEmployee>(`/employees/${id}`);
  return mapEmployee(response.data);
};

export const createEmployee = async (project: Omit<Employee, "id">) => {
  const response = await apiClient.post<ApiEmployee>("/employees", project);
  return mapEmployee(response.data);
};

export const updateEmployee = async (id: number, project: Partial<Employee>) => {
  const response = await apiClient.put<ApiEmployee>(`/employees/${id}`, project);
  return mapEmployee(response.data);
};

export const deleteEmployee = async (id: number) => {
  await apiClient.delete(`/employees/${id}`);
};

export const searchEmployees = async (query: string) => {
  const response = await apiClient.get<EmployeesResponse>("/employees/search", { params: { query } });
  return extractEmployees(response.data).map(mapEmployee);
};
