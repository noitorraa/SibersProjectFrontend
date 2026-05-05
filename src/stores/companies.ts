import { defineStore } from "pinia";
import { ref } from "vue";
import type { Company } from "@/types";
import * as companiesApi from "@/api/companies";

export const useCompaniesStore = defineStore("companies", () => {
  const companies = ref<Company[]>([]);
  const loading = ref(false);

  const fetchCompanies = async () => {
    loading.value = true;
    try {
      companies.value = await companiesApi.getCompanies();
    } finally {
      loading.value = false;
    }
  };

  const fetchCompanyById = async (id: number) => {
    loading.value = true;
    try {
      return await companiesApi.getCompanyById(id);
    } finally {
      loading.value = false;
    }
  };

  const createCompany = async (company: Omit<Company, "id">) => {
    const newCompany = await companiesApi.createCompany(company);
    companies.value.push(newCompany);
    return newCompany;
  };

  const updateCompany = async (id: number, updates: Partial<Company>) => {
    const updated = await companiesApi.updateCompany(id, updates);
    const index = companies.value.findIndex((c) => c.id === id);
    if (index !== -1) companies.value[index] = updated;
    return updated;
  };

  const deleteCompany = async (id: number) => {
    await companiesApi.deleteCompany(id);
    companies.value = companies.value.filter((c) => c.id !== id);
  };

  return {
    companies,
    loading,
    fetchCompanies,
    fetchCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
  };
});
