<template>
  <div>
    <h1>Проекты</h1>
    <button @click="openWizard = true">+ Новый проект</button>

    <section class="filters-panel">
      <h2>Фильтры</h2>
      <div class="filters-grid">
        <label>Начало от<input v-model="localFilters.startDateFrom" type="date" /></label>
        <label>Начало до<input v-model="localFilters.startDateTo" type="date" /></label>
        <label>Окончание от<input v-model="localFilters.endDateFrom" type="date" /></label>
        <label>Окончание до<input v-model="localFilters.endDateTo" type="date" /></label>

        <label>
          Приоритет
          <input v-model.number="localFilters.priority" type="number" min="1" />
        </label>

        <label>
          Статус
          <select v-model="localFilters.status">
            <option value="">Все</option>
            <option value="new">Новый</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Завершён</option>
            <option value="archived">Архив</option>
          </select>
        </label>

        <label>
          Заказчик
          <select v-model.number="localFilters.customer">
            <option :value="undefined">Все</option>
            <option v-for="company in companiesStore.companies" :key="`customer-${company.id}`" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </label>

        <label>
          Исполнитель
          <select v-model.number="localFilters.executor">
            <option :value="undefined">Все</option>
            <option v-for="company in companiesStore.companies" :key="`executor-${company.id}`" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </label>

        <label>
          Менеджер
          <select v-model.number="localFilters.manager">
            <option :value="undefined">Все</option>
            <option v-for="employee in employeesStore.employees" :key="employee.id" :value="employee.id">
              {{ employee.lastName }} {{ employee.firstName }}
            </option>
          </select>
        </label>

        <label>
          Сортировка
          <select v-model="localFilters.sortBy">
            <option value="">Нет</option>
            <option value="name">Название</option>
            <option value="startDate">Дата начала</option>
            <option value="endDate">Дата окончания</option>
            <option value="priority">Приоритет</option>
            <option value="status">Статус</option>
          </select>
        </label>

        <label>
          Направление
          <select v-model="localFilters.sortDirection">
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </label>
      </div>
      <div class="filters-actions">
        <button @click="applyFilters">Применить</button>
        <button @click="resetFilters">Сбросить</button>
      </div>
    </section>

    <div v-if="projectsStore.loading">Загрузка...</div>
    <div v-else>
      <ProjectCard
        v-for="project in projectsStore.projects"
        :key="project.id"
        :project="project"
        @open="goToProject(project.id)"
        @edit="editProject(project.id)"
        @delete="deleteProject(project.id)"
      />
    </div>

    <ProjectWizard v-if="openWizard" @close="openWizard = false" @saved="refreshProjects" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { useCompaniesStore } from "@/stores/companies";
import { useEmployeesStore } from "@/stores/employees";
import type { ProjectFilterParams } from "@/types";
import ProjectCard from "@/components/projects/ProjectCard.vue";
import ProjectWizard from "@/components/projects/ProjectWizard.vue";

const router = useRouter();
const projectsStore = useProjectsStore();
const companiesStore = useCompaniesStore();
const employeesStore = useEmployeesStore();
const openWizard = ref(false);
const localFilters = ref<ProjectFilterParams>({
  ...projectsStore.filters,
  sortDirection: projectsStore.filters.sortDirection ?? "asc",
});

const refreshProjects = () => {
  projectsStore.fetchProjects();
};

const goToProject = (id: number) => {
  router.push(`/projects/${id}`);
};

const editProject = (id: number) => {
  router.push(`/projects/${id}?mode=edit`);
};

const applyFilters = () => {
  projectsStore.filters = {
    ...localFilters.value,
  };
  projectsStore.fetchProjects();
};

const resetFilters = () => {
  localFilters.value = { sortDirection: "asc" };
  projectsStore.filters = {};
  projectsStore.fetchProjects();
};

const deleteProject = async (id: number) => {
  const isConfirmed = window.confirm("Удалить проект? Это действие нельзя отменить.");
  if (!isConfirmed) return;
  await projectsStore.removeProject(id);
};

onMounted(async () => {
  await Promise.all([projectsStore.fetchProjects(), companiesStore.fetchCompanies(), employeesStore.fetchEmployees()]);
});
</script>

<style scoped>
.filters-panel { margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
.filters-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem 1rem; }
label { display: flex; flex-direction: column; gap: 0.25rem; }
.filters-actions { margin-top: 0.75rem; display: flex; gap: 0.5rem; }
</style>
