<template>
  <div class="employees-page">
    <div class="header-row">
    <h1>Сотрудники</h1>
      <button @click="startCreate">+ Добавить сотрудника</button>
    </div>

    <div v-if="employeesStore.loading">Загрузка...</div>
    <div v-else>
      <p v-if="!employeesStore.employees.length">Сотрудники не найдены.</p>
      <table v-else class="employees-table">
        <thead>
          <tr>
            <th>ID</th><th>ФИО</th><th>Email</th><th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employeesStore.employees" :key="employee.id">
            <td>{{ employee.id }}</td>
            <td>{{ employee.lastName }} {{ employee.firstName }} {{ employee.patronymic }}</td>
            <td>{{ employee.email }}</td>
            <td class="actions">
              <button @click="openView(employee.id)">Просмотр</button>
              <button @click="startEdit(employee.id)">Редактировать</button>
              <button class="danger" @click="removeEmployee(employee.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mode" class="modal">
      <div class="modal-card">
        <h3>{{ mode === 'create' ? 'Новый сотрудник' : mode === 'edit' ? 'Редактирование сотрудника' : 'Просмотр сотрудника' }}</h3>
        <form class="form" @submit.prevent="submitForm">
          <label>Имя<input v-model="form.firstName" :readonly="mode === 'view'" required /></label>
          <label>Фамилия<input v-model="form.lastName" :readonly="mode === 'view'" required /></label>
          <label>Отчество<input v-model="form.patronymic" :readonly="mode === 'view'" /></label>
          <label>Email<input v-model="form.email" :readonly="mode === 'view'" type="email" required /></label>

          <div class="actions">
            <button type="button" @click="closeModal">Закрыть</button>
            <button v-if="mode !== 'view'" type="submit">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useEmployeesStore } from "@/stores/employees";

const employeesStore = useEmployeesStore();
const mode = ref<"create" | "edit" | "view" | "">("");
const selectedId = ref<number | null>(null);

const form = reactive({
  firstName: "",
  lastName: "",
  patronymic: "",
  email: "",
});

const fillForm = (employee: { firstName: string; lastName: string; patronymic?: string; email: string }) => {
  form.firstName = employee.firstName;
  form.lastName = employee.lastName;
  form.patronymic = employee.patronymic ?? "";
  form.email = employee.email;
};

const resetForm = () => fillForm({ firstName: "", lastName: "", patronymic: "", email: "" });

const startCreate = () => {
  resetForm();
  selectedId.value = null;
  mode.value = "create";
};

const openView = async (id: number) => {
  const employee = await employeesStore.fetchEmployeeById(id);
  fillForm(employee);
  selectedId.value = id;
  mode.value = "view";
};

const startEdit = async (id: number) => {
  const employee = await employeesStore.fetchEmployeeById(id);
  fillForm(employee);
  selectedId.value = id;
  mode.value = "edit";
};

const closeModal = () => {
  mode.value = "";
  selectedId.value = null;
};

const submitForm = async () => {
  if (mode.value === "create") {
    await employeesStore.createEmployee({ ...form });
  } else if (mode.value === "edit" && selectedId.value) {
    await employeesStore.updateEmployee(selectedId.value, { ...form });
  }
  closeModal();
};

const removeEmployee = async (id: number) => {
  if (!window.confirm("Удалить сотрудника?")) return;
  await employeesStore.deleteEmployee(id);
};

onMounted(async () => {
  await employeesStore.fetchEmployees();
});
</script>

<style scoped>
.employees-page { display: flex; flex-direction: column; gap: 1rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.employees-table { width: 100%; border-collapse: collapse; }
.employees-table th, .employees-table td { border: 1px solid #e2e2e2; padding: .5rem; text-align: left; }
.actions { display: flex; gap: .5rem; }
.danger { background: #fbd5d5; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; justify-content: center; align-items: center; }
.modal-card { background: #fff; padding: 1rem; border-radius: 8px; min-width: 420px; }
.form { display: grid; gap: .6rem; }
label { display: flex; flex-direction: column; gap: .25rem; }
</style>
