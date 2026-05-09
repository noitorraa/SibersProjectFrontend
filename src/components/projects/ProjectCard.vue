<template>
  <div class="project-card" @click="$emit('click')">
    <h3>{{ project.name }}</h3>
    <p><strong>Приоритет:</strong> {{ project.priority }}</p>
    <p><strong>Заказчик:</strong> {{ project.customerCompany?.name || "Не указана" }}</p>
    <p><strong>Исполнитель:</strong> {{ project.executorCompany?.name || "Не указана" }}</p>
    <p><strong>Сроки:</strong> {{ formatDate(project.startDate) }} – {{ formatDate(project.endDate) }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Project } from "@/types";

defineProps<{ project: Project }>();
defineEmits<{ (e: "click"): void }>();

const formatDate = (dateValue: string | null | undefined) => {
  if (!dateValue || typeof dateValue !== "string") return "Не указано";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Не указано";

  return date.toLocaleDateString("ru-RU");
};
</script>

<style scoped>
.project-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
.project-card:hover {
  background: #f5f5f5;
}
</style>
