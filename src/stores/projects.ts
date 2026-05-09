import { defineStore } from "pinia";
import { ref } from "vue";
import type { Project, ProjectFilterParams } from "@/types";
import * as projectApi from "@/api/projects";
import * as employeesApi from "@/api/employees";

export const useProjectsStore = defineStore("projects", () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const loading = ref(false);
  const filters = ref<ProjectFilterParams>({});

  const fetchProjects = async () => {
    loading.value = true;
    try {
      projects.value = await projectApi.getProjects(filters.value);
    } finally {
      loading.value = false;
    }
  };

  const fetchProjectById = async (id: number) => {
    loading.value = true;
    try {
      currentProject.value = await projectApi.getProjectById(id);
      if (currentProject.value && (!currentProject.value.employees || !currentProject.value.employees.length)) {
        currentProject.value.employees = await employeesApi.getEmployeesByProject(id);
      }
    } finally {
      loading.value = false;
    }
  };

  const createNewProject = async (project: Omit<Project, "id">) => {
    const newProject = await projectApi.createProject(project);
    projects.value.push(newProject);
    return newProject;
  };

  const updateExistingProject = async (id: number, updates: Partial<Project>) => {
    const updated = await projectApi.updateProject(id, updates);
    const index = projects.value.findIndex((p) => p.id === id);
    if (index !== -1) projects.value[index] = updated;
    if (currentProject.value?.id === id) currentProject.value = updated;
  };

  const removeProject = async (id: number) => {
    await projectApi.deleteProject(id);
    projects.value = projects.value.filter((p) => p.id !== id);
  };

  const addEmployee = async (projectId: number, employeeId: number) => {
    await projectApi.addEmployeeToProject(projectId, employeeId);
    await fetchProjectById(projectId);
  };

  const removeEmployee = async (projectId: number, employeeId: number) => {
    await projectApi.removeEmployeeFromProject(projectId, employeeId);
    await fetchProjectById(projectId);
  };

  const uploadDocument = async (projectId: number, file: File) => {
    await projectApi.uploadProjectDocument(projectId, file);
    await fetchProjectById(projectId);
  };

  return {
    projects,
    currentProject,
    loading,
    filters,
    fetchProjects,
    fetchProjectById,
    createNewProject,
    updateExistingProject,
    removeProject,
    addEmployee,
    removeEmployee,
    uploadDocument,
  };
});
