<template>
  <div>
    <h1>Проект #{{ projectId }}</h1>

    <div class="tabs">
      <button :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">Общее</button>
      <button :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'">Участники</button>
      <button :class="{ active: activeTab === 'documents' }" @click="activeTab = 'documents'">Документы</button>
    </div>

    <div v-if="projectsStore.loading">Загрузка...</div>

    <template v-else-if="projectsStore.currentProject">
      <form v-if="activeTab === 'general'" class="form" @submit.prevent="saveProject">
        <label>Название<input v-model="form.name" required /></label>
        <label>Дата начала<input v-model="form.startDate" type="date" required /></label>
        <label>Дата окончания<input v-model="form.endDate" type="date" required /></label>
        <label>Приоритет<input v-model.number="form.priority" type="number" min="1" required /></label>

        <label>
          Заказчик
          <select v-model.number="form.customerCompanyId" required>
            <option v-for="company in companyOptions" :key="company.id" :value="company.id">{{ company.name }}</option>
          </select>
        </label>

        <label>
          Исполнитель
          <select v-model.number="form.executorCompanyId" required>
            <option v-for="company in companyOptions" :key="`exec-${company.id}`" :value="company.id">{{ company.name }}</option>
          </select>
        </label>

        <label>
          Руководитель
          <select v-model.number="form.projectManagerId" required>
            <option v-for="employee in managerOptions" :key="employee.id" :value="employee.id">
              {{ employee.lastName }} {{ employee.firstName }}
            </option>
          </select>
        </label>

        <div class="actions">
          <button type="submit">Сохранить</button>
          <button type="button" class="danger" @click="deleteProject">Удалить</button>
          <RouterLink to="/projects">Назад к списку</RouterLink>
        </div>
        <p v-if="message" class="success">{{ message }}</p>
      </form>

      <div v-else-if="activeTab === 'members'">
        <h3>Сотрудники проекта</h3>
        <ul>
          <li v-for="employee in projectsStore.currentProject.employees" :key="employee.id">
            {{ employee.lastName }} {{ employee.firstName }}
            <button @click="removeEmployee(employee.id)">Удалить</button>
          </li>
        </ul>

        <label>
          Добавить сотрудника
          <select v-model.number="selectedEmployeeId">
            <option :value="0">Выберите сотрудника</option>
            <option v-for="employee in availableEmployees" :key="employee.id" :value="employee.id">
              {{ employee.lastName }} {{ employee.firstName }}
            </option>
          </select>
        </label>
        <button :disabled="!selectedEmployeeId" @click="addEmployee">Добавить</button>
      </div>

      <div v-else>
        <h3>Документы</h3>
        <div class="dropzone" @dragover.prevent @drop.prevent="onDrop">
          Перетащите файл сюда или выберите вручную
          <input type="file" @change="onFileSelect" />
        </div>
        <ul>
          <li v-for="doc in projectsStore.currentProject.documents || []" :key="doc.id">{{ doc.fileName }}</li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { useCompaniesStore } from "@/stores/companies";
import { useEmployeesStore } from "@/stores/employees";

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const companiesStore = useCompaniesStore();
const employeesStore = useEmployeesStore();

const projectId = Number(route.params.id);
const activeTab = ref<"general" | "members" | "documents">("general");
const selectedEmployeeId = ref(0);
const message = ref("");

const form = reactive({
  name: "",
  startDate: "",
  endDate: "",
  priority: 1,
  customerCompanyId: 0,
  executorCompanyId: 0,
  projectManagerId: 0,
});

const projectsAsFallback = computed(() => projectsStore.projects.find((p) => p.id === projectId));

const companyOptions = computed(() => {
  const fromStore = companiesStore.companies;
  if (fromStore.length) return fromStore;

  const projects = projectsStore.projects;
  const map = new Map<number, { id: number; name: string }>();
  for (const project of projects) {
    if (project.customerCompany?.id) map.set(project.customerCompany.id, project.customerCompany);
    if (project.executorCompany?.id) map.set(project.executorCompany.id, project.executorCompany);
  }
  return [...map.values()];
});

const managerOptions = computed(() => {
  const fromStore = employeesStore.employees;
  if (fromStore.length) return fromStore;

  const map = new Map<number, any>();
  for (const project of projectsStore.projects) {
    if (project.projectManager?.id) map.set(project.projectManager.id, project.projectManager);
    for (const employee of project.employees ?? []) {
      if (employee.id) map.set(employee.id, employee);
    }
  }
  return [...map.values()];
});

const fillForm = () => {
  const project = projectsStore.currentProject ?? projectsAsFallback.value;
  if (!project) return;

  form.name = project.name || "";
  form.startDate = project.startDate?.slice(0, 10) || "";
  form.endDate = project.endDate?.slice(0, 10) || "";
  form.priority = project.priority;
  form.customerCompanyId = project.customerCompany?.id ?? 0;
  form.executorCompanyId = project.executorCompany?.id ?? 0;
  form.projectManagerId = project.projectManager?.id ?? 0;
};

const availableEmployees = computed(() => {
  const assigned = new Set((projectsStore.currentProject?.employees ?? []).map((e) => e.id));
  return employeesStore.employees.filter((e) => !assigned.has(e.id));
});

const saveProject = async () => {
  await projectsStore.updateExistingProject(projectId, {
    name: form.name,
    startDate: form.startDate,
    endDate: form.endDate,
    priority: form.priority,
    customerCompany: companyOptions.value.find((c) => c.id === form.customerCompanyId),
    executorCompany: companyOptions.value.find((c) => c.id === form.executorCompanyId),
    projectManager: managerOptions.value.find((e) => e.id === form.projectManagerId),
  });

  await projectsStore.fetchProjectById(projectId);
  fillForm();
  message.value = "Проект сохранён";
};

const deleteProject = async () => {
  await projectsStore.removeProject(projectId);
  router.push("/projects");
};

const addEmployee = async () => {
  if (!selectedEmployeeId.value) return;
  await projectsStore.addEmployee(projectId, selectedEmployeeId.value);
  selectedEmployeeId.value = 0;
};

const removeEmployee = async (employeeId: number) => {
  await projectsStore.removeEmployee(projectId, employeeId);
};

const uploadFile = async (file?: File | null) => {
  if (!file) return;
  await projectsStore.uploadDocument(projectId, file);
};

const onFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  await uploadFile(input.files?.[0] ?? null);
};

const onDrop = async (event: DragEvent) => {
  await uploadFile(event.dataTransfer?.files?.[0] ?? null);
};

onMounted(async () => {
  await Promise.all([
    projectsStore.fetchProjects(),
    projectsStore.fetchProjectById(projectId),
    companiesStore.fetchCompanies(),
    employeesStore.fetchEmployees(),
  ]);
  fillForm();
});
</script>

<style scoped>
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.tabs .active { font-weight: bold; }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; max-width: 800px; }
label { display: flex; flex-direction: column; gap: 0.25rem; }
.actions { grid-column: 1 / -1; display: flex; gap: 0.75rem; align-items: center; }
.danger { background: #fbd5d5; }
.success { grid-column: 1 / -1; color: #0a7a36; }
.dropzone { border: 1px dashed #999; padding: 1rem; margin-bottom: 1rem; }
</style>
