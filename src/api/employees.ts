import apiClient from "./client";
import type { Employee } from "@/types";

export const getEmployees = async () => {
  const response = await apiClient.get<Employee[]>("/employees");
  return response.data;
};

export const getEmployeeById = async (id: number) => {
  const response = await apiClient.get<Employee>(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (project: Omit<Employee, "id">) => {
  const response = await apiClient.post<Employee>("/employees", project);
  return response.data;
};

export const updateEmployee = async (id: number, project: Partial<Employee>) => {
  const response = await apiClient.put<Employee>(`/employees/${id}`, project);
  return response.data;
};

export const deleteEmployee = async (id: number) => {
  await apiClient.delete(`/employees/${id}`);
};

export const searchEmployees = async (query: string) => {
  const response = await apiClient.get<Employee[]>("/employees/search", { params: { query } });
  return response.data;
};
