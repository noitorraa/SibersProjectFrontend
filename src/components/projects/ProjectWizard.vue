<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
      <h2>Новый проект</h2>

      <form class="wizard-form" @submit.prevent="save">
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
            <option v-for="employee in employeesStore.employees" :key="employee.id" :value="employee.id">{{ employee.lastName }} {{ employee.firstName }}</option>
          </select>
        </label>

        <button type="submit">Создать проект</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { useProjectsStore } from "@/stores/projects";
import { useCompaniesStore } from "@/stores/companies";
import { useEmployeesStore } from "@/stores/employees";

const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const projectsStore = useProjectsStore();
const companiesStore = useCompaniesStore();
const employeesStore = useEmployeesStore();

const form = reactive({
  name: "",
  startDate: "",
  endDate: "",
  priority: 1,
  customerCompanyId: 0,
  executorCompanyId: 0,
  projectManagerId: 0,
});

const companyOptions = computed(() => {
  if (companiesStore.companies.length) return companiesStore.companies;

  const map = new Map<number, { id: number; name: string }>();
  for (const project of projectsStore.projects) {
    if (project.customerCompany?.id) map.set(project.customerCompany.id, project.customerCompany);
    if (project.executorCompany?.id) map.set(project.executorCompany.id, project.executorCompany);
  }
  return [...map.values()];
});

const save = async () => {
  await projectsStore.createNewProject({
    name: form.name,
    startDate: form.startDate,
    endDate: form.endDate,
    priority: form.priority,
    customerCompany: companyOptions.value.find((c) => c.id === form.customerCompanyId)!,
    executorCompany: companyOptions.value.find((c) => c.id === form.executorCompanyId)!,
    projectManager: employeesStore.employees.find((e) => e.id === form.projectManagerId)!,
    employees: [],
  });

  emit("saved");
  emit("close");
};

onMounted(async () => {
  await Promise.allSettled([companiesStore.fetchCompanies(), employeesStore.fetchEmployees()]);
});
</script>

<style scoped>
.modal { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; padding: 1.5rem; border-radius: 8px; min-width: 420px; position: relative; }
.close { position: absolute; right: .75rem; top: .5rem; cursor: pointer; font-size: 1.5rem; }
.wizard-form { display: grid; gap: .6rem; }
label { display: flex; flex-direction: column; gap: .25rem; }
</style>
