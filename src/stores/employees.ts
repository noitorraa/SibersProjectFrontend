import { defineStore } from "pinia";
import { ref } from "vue";
import type { Employee } from "@/types";
import * as employeesApi from "@/api/employees";

export const useEmployeesStore = defineStore("employees", () => {
  const employees = ref<Employee[]>([]);
  const loading = ref(false);

  const fetchEmployees = async () => {
    loading.value = true;
    try {
      employees.value = await employeesApi.getEmployees();
    } finally {
      loading.value = false;
    }
  };

  const fetchEmployeeById = async (id: number) => {
    loading.value = true;
    try {
      return await employeesApi.getEmployeeById(id);
    } finally {
      loading.value = false;
    }
  };

  const createEmployee = async (employee: Omit<Employee, "id">) => {
    const newEmployee = await employeesApi.createEmployee(employee);
    employees.value.push(newEmployee);
    return newEmployee;
  };

  const updateEmployee = async (id: number, updates: Partial<Employee>) => {
    const updated = await employeesApi.updateEmployee(id, updates);
    const index = employees.value.findIndex((e) => e.id === id);
    if (index !== -1) employees.value[index] = updated;
    return updated;
  };

  const deleteEmployee = async (id: number) => {
    await employeesApi.deleteEmployee(id);
    employees.value = employees.value.filter((e) => e.id !== id);
  };

  const searchEmployees = async (query: string) => {
    return await employeesApi.searchEmployees(query);
  };

  return {
    employees,
    loading,
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployees,
  };
});
