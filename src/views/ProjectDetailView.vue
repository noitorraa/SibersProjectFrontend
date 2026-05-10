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
          <EmployeeAutocomplete
            v-model="managerSearch"
            :options="managerSearchOptions"
            placeholder="Начните вводить имя, фамилию или email"
            required
            @search="onManagerInput"
            @select="onManagerSelect"
          />
        </label>

        <div class="actions">
          <button type="submit">Сохранить</button>
          <button type="button" class="danger" @click="deleteProject">Удалить</button>
          <RouterLink to="/projects">Назад к списку</RouterLink>
        </div>
        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
          <EmployeeAutocomplete
            v-model="employeeSearch"
            :options="employeeSearchOptions"
            placeholder="Начните вводить имя, фамилию или email"
            @search="onEmployeeInput"
            @select="onEmployeeSelect"
          />
        </label>
        <button :disabled="!selectedEmployeeId" @click="addEmployee">Добавить</button>
      </div>

      <div v-else>
        <h3>Документы</h3>
        <div class="dropzone" :class="{ dragging: isDragOver }" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">
          <p>Перетащите файл сюда или выберите вручную</p>
          <input ref="fileInputRef" type="file" @change="onFileSelect" />
        </div>
        <div class="actions">
          <span v-if="pendingFile">Выбран файл: {{ pendingFile.name }}</span>
          <button :disabled="!pendingFile" @click="saveDocument">Сохранить файл</button>
        </div>
        <p v-if="documentsLoading">Загрузка документов...</p>
        <ul>
          <li v-for="doc in projectsStore.currentProject.documents || []" :key="doc.id">
            <strong>{{ doc.fileName }}</strong>
            <span class="doc-meta">Путь: {{ doc.filePath }}</span>
            <span class="doc-meta">Загружен: {{ formatDate(doc.uploadedAt) }}</span>
            <button @click="openDocumentInfo(doc.id)">Информация</button>
            <button @click="deleteDocument(doc.id)">Удалить</button>
          </li>
        </ul>
        <div v-if="selectedDocument" class="document-info">
          <h4>Информация о документе</h4>
          <p>Id: {{ selectedDocument.id }}</p>
          <p>Имя: {{ selectedDocument.fileName }}</p>
          <p>Путь: {{ selectedDocument.filePath }}</p>
          <p>Дата загрузки: {{ formatDate(selectedDocument.uploadedAt) }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { useEmployeesStore } from "@/stores/employees";
import { getProjectDocumentById } from "@/api/projects";
import type { Employee, ProjectDocument } from "@/types";
import EmployeeAutocomplete from "@/components/common/EmployeeAutocomplete.vue";

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const employeesStore = useEmployeesStore();

const projectId = Number(route.params.id);
const activeTab = ref<"general" | "members" | "documents">("general");
const selectedEmployeeId = ref(0);
const message = ref("");
const errorMessage = ref("");
const pendingFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedDocument = ref<ProjectDocument | null>(null);
const documentsLoading = ref(false);
const isDragOver = ref(false);
const managerSearch = ref("");
const managerSearchOptions = ref<Employee[]>([]);
const employeeSearch = ref("");
const employeeSearchOptions = ref<Employee[]>([]);
let managerSearchTimer: ReturnType<typeof setTimeout> | null = null;
let employeeSearchTimer: ReturnType<typeof setTimeout> | null = null;

const form = reactive({
  name: "",
  startDate: "",
  endDate: "",
  priority: 1,
  customerCompanyId: 0,
  executorCompanyId: 0,
  projectManagerId: 0,
});

const projectsAsFallback = computed(() => projectsStore.projects.find((p) => Number(p.id) === projectId));

const companyOptions = computed(() => {
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

  const map = new Map<number, { id: number; firstName: string; lastName: string; patronymic?: string; email: string }>();
  for (const project of projectsStore.projects) {
    if (project.projectManager?.id) map.set(project.projectManager.id, project.projectManager);
    for (const employee of project.employees ?? []) {
      if (employee.id) map.set(employee.id, employee);
    }
  }
  return [...map.values()];
});

const fillForm = () => {
  console.log("[ProjectDetail] fillForm input", {
    routeProjectId: projectId,
    currentProject: projectsStore.currentProject,
    fallbackProject: projectsAsFallback.value,
    companiesCount: companyOptions.value.length,
    managersCount: managerOptions.value.length,
  });
  const project = projectsStore.currentProject ?? projectsAsFallback.value;
  if (!project) return;

  form.name = project.name || "";
  form.startDate = project.startDate?.slice(0, 10) || "";
  form.endDate = project.endDate?.slice(0, 10) || "";
  form.priority = project.priority;
  form.customerCompanyId = project.customerCompany?.id ?? 0;
  form.executorCompanyId = project.executorCompany?.id ?? 0;
  form.projectManagerId = project.projectManager?.id ?? 0;
  if (project.projectManager) {
    managerSearch.value = formatEmployee(project.projectManager);
    managerSearchOptions.value = [project.projectManager];
  }

  console.log("[ProjectDetail] fillForm output", { ...form });
};

const formatEmployee = (employee: Employee) => `${employee.lastName} ${employee.firstName} (${employee.email})`;

const onManagerSelect = (employee: Employee) => {
  form.projectManagerId = employee.id;
};

const onManagerInput = (query: string) => {
  form.projectManagerId = managerSearchOptions.value.find((e) => formatEmployee(e) === managerSearch.value)?.id ?? 0;

  if (managerSearchTimer) clearTimeout(managerSearchTimer);
  managerSearchTimer = setTimeout(async () => {
    if (query.length < 2) {
      managerSearchOptions.value = [];
      return;
    }
    managerSearchOptions.value = await employeesStore.searchEmployees(query);
  }, 300);
};

const onEmployeeSelect = (employee: Employee) => {
  selectedEmployeeId.value = employee.id;
};

const onEmployeeInput = (query: string) => {
  selectedEmployeeId.value = employeeSearchOptions.value.find((e) => formatEmployee(e) === employeeSearch.value)?.id ?? 0;

  if (employeeSearchTimer) clearTimeout(employeeSearchTimer);
  employeeSearchTimer = setTimeout(async () => {
    if (query.length < 2) {
      employeeSearchOptions.value = [];
      return;
    }
    const found = await employeesStore.searchEmployees(query);
    const assigned = new Set((projectsStore.currentProject?.employees ?? []).map((e) => e.id));
    employeeSearchOptions.value = found.filter((e) => !assigned.has(e.id));
  }, 300);
};

const saveProject = async () => {
  errorMessage.value = "";
  await projectsStore.updateExistingProject(projectId, {
    name: form.name,
    startDate: form.startDate,
    endDate: form.endDate,
    priority: form.priority,
    customerCompany: companyOptions.value.find((c) => c.id === form.customerCompanyId),
    executorCompany: companyOptions.value.find((c) => c.id === form.executorCompanyId),
    projectManager: managerOptions.value.find((e) => e.id === form.projectManagerId),
    status: projectsStore.currentProject?.status ?? "Active",
  });

  await projectsStore.fetchProjectById(projectId);
  console.log("[ProjectDetail] loaded state", {
    currentProject: projectsStore.currentProject,
    projectsCount: projectsStore.projects.length,
    employeesCount: employeesStore.employees.length,
  });
  fillForm();
  message.value = "Проект сохранён";
  setTimeout(() => {
    router.push("/projects");
  }, 600);
};

const deleteProject = async () => {
  if (!window.confirm("Удалить проект? Это действие нельзя отменить.")) return;
  await projectsStore.removeProject(projectId);
  router.push("/projects");
};

const addEmployee = async () => {
  if (!selectedEmployeeId.value) return;
  errorMessage.value = "";
  try {
    await projectsStore.addEmployee(projectId, selectedEmployeeId.value);
    selectedEmployeeId.value = 0;
    employeeSearch.value = "";
    employeeSearchOptions.value = [];
    message.value = "Сотрудник добавлен";
  } catch (error: unknown) {
    errorMessage.value = (error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Не удалось добавить сотрудника";
  }
};

const removeEmployee = async (employeeId: number) => {
  await projectsStore.removeEmployee(projectId, employeeId);
};

const uploadFile = async (file?: File | null) => {
  if (!file) return;
  pendingFile.value = file;
};

const saveDocument = async () => {
  if (!pendingFile.value) return;
  errorMessage.value = "";
  await projectsStore.uploadDocument(projectId, pendingFile.value);
  pendingFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
  message.value = "Файл сохранён";
};

const deleteDocument = async (documentId: number) => {
  errorMessage.value = "";
  await projectsStore.removeDocument(projectId, documentId);
  if (selectedDocument.value?.id === documentId) selectedDocument.value = null;
  message.value = "Файл удалён";
};

const openDocumentInfo = async (documentId: number) => {
  if (!projectsStore.currentProject?.id) return;
  selectedDocument.value = await getProjectDocumentById(projectId, documentId);
};

const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
};

const onFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  await uploadFile(input.files?.[0] ?? null);
};

const onDrop = async (event: DragEvent) => {
  isDragOver.value = false;
  await uploadFile(event.dataTransfer?.files?.[0] ?? null);
};

const onDragOver = () => {
  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

onMounted(async () => {
  console.log("[ProjectDetail] mounted", { routeParams: route.params, projectId });
  await Promise.allSettled([
    projectsStore.fetchProjects(),
    projectsStore.fetchProjectById(projectId),
    employeesStore.fetchEmployees(),
  ]);
  console.log("[ProjectDetail] loaded state", {
    currentProject: projectsStore.currentProject,
    projectsCount: projectsStore.projects.length,
    employeesCount: employeesStore.employees.length,
  });
  fillForm();
  documentsLoading.value = true;
  await projectsStore.fetchProjectDocuments(projectId);
  documentsLoading.value = false;
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
.error { grid-column: 1 / -1; color: #c21d1d; }
.dropzone { border: 1px dashed #999; padding: 1rem; margin-bottom: 1rem; }
.dropzone.dragging { border-color: #1d70b8; background: #eef6ff; }
.doc-meta { margin-left: 0.5rem; color: #555; }
.document-info { margin-top: 1rem; border: 1px solid #ddd; padding: 0.75rem; border-radius: 8px; max-width: 480px; }
</style>
