import apiClient from "./client";
import type { Company } from "@/types";

export const getCompanies = async () => {
  const response = await apiClient.get<Company[]>("/companies");
  return response.data;
};

export const getCompanyById = async (id: number) => {
  const response = await apiClient.get<Company>(`/companies/${id}`);
  return response.data;
};

export const createCompany = async (company: Omit<Company, "id">) => {
  const response = await apiClient.post<Company>("/companies", company);
  return response.data;
};

export const updateCompany = async (id: number, company: Partial<Company>) => {
  const response = await apiClient.put<Company>(`/companies/${id}`, company);
  return response.data;
};

export const deleteCompany = async (id: number) => {
  await apiClient.delete(`/companies/${id}`);
};
