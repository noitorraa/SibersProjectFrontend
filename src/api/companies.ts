import apiClient from "./client";
import type { Company } from "@/types";

type ApiCompany = Partial<Company> & { Id?: number; Name?: string };
type CompaniesResponse = ApiCompany[] | { items?: ApiCompany[]; data?: ApiCompany[]; results?: ApiCompany[]; Items?: ApiCompany[]; Data?: ApiCompany[]; Results?: ApiCompany[] };

const mapCompany = (company: ApiCompany): Company => ({
  id: company.id ?? company.Id ?? 0,
  name: company.name ?? company.Name ?? "",
});

const extractCompanies = (payload: CompaniesResponse): ApiCompany[] => {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.Items ?? payload.data ?? payload.Data ?? payload.results ?? payload.Results ?? (payload as any).$values ?? (payload as any).value ?? (payload as any).Value ?? [];
};

export const getCompanies = async () => {
  const response = await apiClient.get<CompaniesResponse>("/Companies");
  return extractCompanies(response.data).map(mapCompany);
};

export const getCompanyById = async (id: number) => {
  const response = await apiClient.get<ApiCompany>(`/Companies/${id}`);
  return mapCompany(response.data);
};

export const createCompany = async (company: Omit<Company, "id">) => {
  const response = await apiClient.post<ApiCompany>("/Companies", company);
  return mapCompany(response.data);
};

export const updateCompany = async (id: number, company: Partial<Company>) => {
  const response = await apiClient.put<ApiCompany>(`/Companies/${id}`, company);
  return mapCompany(response.data);
};

export const deleteCompany = async (id: number) => {
  await apiClient.delete(`/Companies/${id}`);
};
