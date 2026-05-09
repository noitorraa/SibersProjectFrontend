<template>
  <div class="projects-page">
    <div class="header-row">
      <h1>Проекты</h1>
      <button @click="openWizard = true">+ Новый проект</button>
    </div>

    <section class="filters-panel">
      <h2>Фильтры</h2>
      <div class="filters-grid">
        <label>
          Дата начала от
          <input v-model="localFilters.startDateFrom" type="date" />
        </label>
        <label>
          Дата начала до
          <input v-model="localFilters.startDateTo" type="date" />
        </label>
        <label>
          Дата окончания от
          <input v-model="localFilters.endDateFrom" type="date" />
        </label>
        <label>
          Дата окончания до
          <input v-model="localFilters.endDateTo" type="date" />
        </label>
        <label>
          Приоритет
          <input v-model.number="localFilters.priority" type="number" min="1" />
        </label>
        <label>
          Статус
          <select v-model="localFilters.status">
            <option value="">Любой</option>
            <option value="Planned">Planned</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="OnHold">OnHold</option>
          </select>
        </label>
        <label>
          Заказчик
          <select v-model.number="localFilters.customerCompanyId">
            <option :value="undefined">Любой</option>
            <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">{{ company.name }}</option>
          </select>
        </label>
        <label>
          Исполнитель
          <select v-model.number="localFilters.executorCompanyId">
            <option :value="undefined">Любой</option>
            <option v-for="company in companiesStore.companies" :key="`exec-${company.id}`" :value="company.id">{{ company.name }}</option>
          </select>
        </label>
        <label>
          Менеджер
          <select v-model.number="localFilters.projectManagerId">
            <option :value="undefined">Любой</option>
            <option v-for="employee in employeesStore.employees" :key="employee.id" :value="employee.id">
              {{ employee.lastName }} {{ employee.firstName }}
            </option>
          </select>
        </label>
        <label>
          Сортировка
          <select v-model="localFilters.sortBy">
            <option value="">По умолчанию</option>
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
      <div class="filter-actions">
        <button @click="applyFilters">Применить</button>
        <button class="secondary" @click="resetFilters">Сбросить</button>
      </div>
    </section>

    <div v-if="projectsStore.loading">Загрузка...</div>
    <div v-else>
      <p v-if="!projectsStore.projects.length">Проекты не найдены.</p>
      <ProjectCard
        v-for="project in projectsStore.projects"
        :key="project.id"
        :project="project"
        @click="goToProject(project.id)"
      />
    </div>
    <ProjectWizard v-if="openWizard" @close="openWizard = false" @saved="refreshProjects" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { useCompaniesStore } from "@/stores/companies";
import { useEmployeesStore } from "@/stores/employees";
import ProjectCard from "@/components/projects/ProjectCard.vue";
import ProjectWizard from "@/components/projects/ProjectWizard.vue";
import type { ProjectFilterParams } from "@/types";

const router = useRouter();
const projectsStore = useProjectsStore();
const companiesStore = useCompaniesStore();
const employeesStore = useEmployeesStore();
const openWizard = ref(false);

const localFilters = reactive<ProjectFilterParams>({
  sortDirection: "asc",
});

const sanitizeFilters = (filters: ProjectFilterParams): ProjectFilterParams =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)) as ProjectFilterParams;

const applyFilters = () => {
  projectsStore.filters = sanitizeFilters({ ...localFilters });
  projectsStore.fetchProjects();
};

const resetFilters = () => {
  Object.assign(localFilters, {
    startDateFrom: undefined,
    startDateTo: undefined,
    endDateFrom: undefined,
    endDateTo: undefined,
    priority: undefined,
    status: undefined,
    customerCompanyId: undefined,
    executorCompanyId: undefined,
    projectManagerId: undefined,
    sortBy: undefined,
    sortDirection: "asc",
  } as ProjectFilterParams);

  projectsStore.filters = {};
  projectsStore.fetchProjects();
};

const refreshProjects = () => {
  projectsStore.fetchProjects();
};

const goToProject = (id: number) => {
  router.push(`/projects/${id}`);
};

onMounted(async () => {
  await Promise.all([projectsStore.fetchProjects(), companiesStore.fetchCompanies(), employeesStore.fetchEmployees()]);
});
</script>

<style scoped>
.projects-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filters-panel {
  border: 1px solid #e2e2e2;
  border-radius: 8px;
  padding: 1rem;
}
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.filter-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}
.secondary {
  background: #f5f5f5;
}
</style>
